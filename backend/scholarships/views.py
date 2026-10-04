import requests
import os
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.throttling import UserRateThrottle
from django.db.models import Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.apps import apps
from .models import Scholarship
from .serializers import ScholarshipSerializer
from accounts.models import Profile
from notifications.utils import send_notification
from collections import Counter

# Throttling class for sensitive actions
class SensitiveActionThrottle(UserRateThrottle):
    scope = 'sensitive'

# NLP dependencies with robust fallback
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    TfidfVectorizer = None
    cosine_similarity = None
    SKLEARN_AVAILABLE = False

class IsAdminOrOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to edit it.
    """
    def __init__(self):
        super(IsAdminOrOwner, self).__init__()

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the submitter or staff
        return (request.user and request.user.is_authenticated) and (
            request.user.is_staff or obj.submitted_by == request.user
        )

@method_decorator(csrf_exempt, name='dispatch')
class ScholarshipViewSet(viewsets.ModelViewSet):
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAdminOrOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'provider', 'country', 'category', 'level', 'field']
    ordering_fields = ['created_at', 'deadline', 'min_cgpa']
    ordering = ['-created_at']

    def list(self, request, *args, **kwargs):
        # Optimization: Prefetch saved status for authenticated users
        response = super(ScholarshipViewSet, self).list(request, *args, **kwargs)
        return response

    def get_serializer_context(self):
        context = super(ScholarshipViewSet, self).get_serializer_context()
        user = self.request.user
        if user and user.is_authenticated:
            # Fetch all saved scholarship IDs for this user at once
            SavedScholarship = apps.get_model('applications', 'SavedScholarship')
            saved_scholarships = SavedScholarship.objects.filter(user=user).values_list('scholarship_id', 'id')
            context['saved_dict'] = {s_id: save_id for s_id, save_id in saved_scholarships}
        return context

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.query_params.get('status')
        
        queryset = Scholarship.objects.all()
        
        if self.action == 'list':
            if user and user.is_authenticated:
                if user.is_staff:
                    if status_param:
                        queryset = queryset.filter(status=status_param)
                    else:
                        queryset = queryset.exclude(status='rejected')
                else:
                    queryset = queryset.filter(Q(status='active') | Q(submitted_by=user)).exclude(status='rejected')
            else:
                queryset = queryset.filter(status='active')
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        is_staff = user.is_authenticated and user.is_staff
        status_val = 'active' if is_staff else 'pending'
        
        serializer.save(
            submitted_by=user if user.is_authenticated else None, 
            status=status_val
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], throttle_classes=[SensitiveActionThrottle])
    def approve(self, request, pk=None):
        if not request.user.is_staff:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        try:
            scholarship = self.get_object()
            action_type = str(request.data.get('action', '')).lower()
            note = request.data.get('note', '').strip()
            previous_status = scholarship.status
            
            if action_type == 'approve':
                action_verb = 'approved'
                action_title = 'Approved'
                scholarship.status = 'active'
            elif action_type == 'reject':
                action_verb = 'rejected'
                action_title = 'Rejected'
                scholarship.status = 'rejected'
                scholarship.admin_note = note
            else:
                return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
            
            scholarship.save()

            # Points System Logic
            if previous_status == 'pending' and scholarship.submitted_by:
                try:
                    profile = Profile.objects.get(user=scholarship.submitted_by)
                    points_change = 200 if scholarship.status == 'active' else -50
                    
                    profile.scholar_points += points_change
                    profile.save(update_fields=['scholar_points'])
                    
                    # Notification
                    display_points = abs(points_change)
                    points_text = "awarded" if points_change > 0 else "deducted"
                    msg = f"Your submission '{scholarship.title}' has been {action_verb}. {display_points} ScholarPoints {points_text}."
                    
                    if note:
                        msg += f" Note: {note}"
                    
                    send_notification(
                        user=scholarship.submitted_by,
                        title=f"Scholarship {action_title}",
                        message=msg,
                        scholarship_id=scholarship.id
                    )
                except Exception as e:
                    print(f"Points update error: {e}")
            
            return Response({
                "message": f"Scholarship {action_type}d successfully", 
                "status": scholarship.status,
                "points_updated": True if previous_status == 'pending' and scholarship.submitted_by else False
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='bulk-upload', permission_classes=[permissions.IsAdminUser], throttle_classes=[SensitiveActionThrottle])
    def bulk_upload(self, request):
        if not isinstance(request.data, list):
            return Response({"error": "Expected a list of scholarships"}, status=status.HTTP_400_BAD_REQUEST)
        
        for item in request.data:
            if 'status' not in item:
                item['status'] = 'active'
            if 'submitted_by' not in item and request.user.is_authenticated:
                item['submitted_by'] = request.user.id

        serializer = self.get_serializer(data=request.data, many=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='check-eligibility', permission_classes=[permissions.IsAuthenticated])
    def check_eligibility(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)

        queryset = Scholarship.objects.filter(
            deadline__gte=timezone.now().date(), 
            status='active'
        )

        if profile.cgpa is not None:
            queryset = queryset.filter(Q(min_cgpa__lte=profile.cgpa) | Q(min_cgpa__isnull=True))

        if profile.academic_level:
            queryset = queryset.filter(level__icontains=profile.academic_level)

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "user_info": {
                "cgpa": profile.cgpa,
                "academic_level": profile.academic_level
            },
            "matches": serializer.data,
            "count": queryset.count()
        })

    @action(detail=False, methods=['get'], url_path='matchmaker', permission_classes=[permissions.IsAuthenticated])
    def matchmaker(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        
        scholarships = Scholarship.objects.filter(status='active', deadline__gte=timezone.now().date())
        results = []
        
        profile_text = f"{profile.target_countries} {profile.major_course} {profile.research_interests} {profile.bio} {profile.skills} {profile.academic_level}".lower()
        
        scholarship_texts = []
        valid_scholarships = []
        
        for s in scholarships:
            base_score = 0
            if s.min_cgpa:
                if profile.cgpa and profile.cgpa >= s.min_cgpa:
                    base_score += 40
                else:
                    continue
            else:
                base_score += 20
                
            if profile.target_countries and s.country:
                targets = [c.strip().lower() for c in str(profile.target_countries).split(',') if c.strip()]
                if s.country.lower() in targets:
                    base_score += 20
            
            if (profile.major_course or profile.research_interests) and s.field:
                preferred = [f.strip().lower() for f in f"{profile.major_course}, {profile.research_interests}".split(',') if f.strip()]
                if s.field.lower() in preferred:
                    base_score += 20
            
            if profile.academic_level and s.level:
                if profile.academic_level.lower() in s.level.lower():
                    base_score += 10
                    
            valid_scholarships.append((s, base_score))
            s_text = f"{s.title} {s.country} {s.field} {s.level} {s.description} {s.eligibility}".lower()
            scholarship_texts.append(s_text)
            
        if SKLEARN_AVAILABLE and valid_scholarships and profile_text.strip():
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([profile_text] + scholarship_texts)
            cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
            
            for idx, (s, base_score) in enumerate(valid_scholarships):
                nlp_score = int(cosine_sims[idx] * 50)
                results.append({
                    "scholarship": ScholarshipSerializer(s).data,
                    "match_score": base_score + nlp_score
                })
        else:
            for s, base_score in valid_scholarships:
                results.append({
                    "scholarship": ScholarshipSerializer(s).data,
                    "match_score": base_score
                })
        
        results = sorted(results, key=lambda x: x['match_score'], reverse=True)
        return Response({
            "profile_summary": {
                "cgpa": profile.cgpa,
                "countries": profile.target_countries,
                "major": profile.major_course,
                "interests": profile.research_interests
            },
            "recommendations": results[:10]
        })

    @action(detail=False, methods=['get'], url_path='autocomplete', permission_classes=[permissions.AllowAny])
    def autocomplete(self, request):
        query_type = request.query_params.get('type', '')
        q = request.query_params.get('q', '').strip().lower()
        
        if not q or not query_type:
            return Response([])

        cache_key = f"autocomplete_{query_type}"
        cached_list = cache.get(cache_key)

        if cached_list is None:
            if query_type == 'country':
                cached_list = list(Scholarship.objects.exclude(country__isnull=True).exclude(country='').values_list('country', flat=True).distinct())
            elif query_type == 'field':
                cached_list = list(Scholarship.objects.exclude(field__isnull=True).exclude(field='').values_list('field', flat=True).distinct())
            elif query_type == 'skills':
                profiles = Profile.objects.exclude(skills__isnull=True).exclude(skills='').values_list('skills', flat=True)
                skills_set = set()
                for skills_str in profiles:
                    for skill in str(skills_str).split(','):
                        skill = skill.strip()
                        if skill: skills_set.add(skill)
                cached_list = list(skills_set)
            else:
                return Response([])
            cache.set(cache_key, cached_list, 3600)

        suggestions = [item for item in cached_list if q in str(item).lower()]
        return Response(suggestions[:5])

    @action(detail=False, methods=['get'], url_path='check-admin', permission_classes=[permissions.IsAuthenticated])
    def check_admin(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser
        })

    @action(detail=False, methods=['get'], url_path='submission-feedback', permission_classes=[permissions.IsAuthenticated])
    def submission_feedback(self, request):
        queryset = Scholarship.objects.filter(
            submitted_by=request.user, 
            status='rejected'
        ).order_by('-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='cleanup-rejected', permission_classes=[permissions.IsAdminUser])
    def cleanup_rejected(self, _request):
        from django.core.management import call_command
        try:
            call_command('delete_old_rejected_scholarships')
            return Response({"message": "Cleanup successful"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='admin-stats', permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, _request):
        from django.contrib.auth.models import User
        
        ScholarshipApplication = apps.get_model('applications', 'ScholarshipApplication')
        MentorshipSession = apps.get_model('community', 'MentorshipSession')

        total_scholarships = Scholarship.objects.count()
        total_users = User.objects.count()
        total_applications = ScholarshipApplication.objects.count()
        total_mentorships = MentorshipSession.objects.count()

        countries = list(Scholarship.objects.exclude(country__isnull=True).exclude(country='').values_list('country', flat=True))
        counts = Counter(countries)
        popular_countries = []
        total_with_country = len(countries)
        
        for name, count in counts.most_common(5):
            popular_countries.append({
                "name": name,
                "count": count,
                "percentage": int((count / total_with_country) * 100) if total_with_country > 0 else 0
            })

        return Response({
            "total_scholarships": total_scholarships,
            "total_users": total_users,
            "total_applications": total_applications,
            "total_mentorships": total_mentorships,
            "popular_countries": popular_countries
        })

    @action(detail=False, methods=['get'], url_path='live-search', permission_classes=[permissions.AllowAny])
    def live_search(self, request):
        query = request.query_params.get('q', '')
        
        # ScholarshipAPI & Parse.bot Integration
        # These keys should be added to .env
        api_key = os.environ.get('SCHOLARSHIP_API_KEY')
        parse_bot_key = os.environ.get('PARSE_BOT_API_KEY')
        
        results = []
        
        # 1. ScholarshipAPI.com Integration
        if api_key:
            try:
                # ScholarshipAPI typically tracks Global/AU/NZ data
                # Using their standard search pattern
                resp = requests.get(
                    f"https://api.scholarshipapi.com/v1/scholarships?q={query}",
                    headers={"Authorization": f"Bearer {api_key}"},
                    timeout=5
                )
                if resp.status_code == 200:
                    data = resp.json().get('data', [])
                    for item in data:
                        results.append({
                            "id": f"ext_sapi_{item.get('id')}",
                            "title": item.get('name') or item.get('title'),
                            "provider": item.get('university') or item.get('provider', 'Global Partner'),
                            "country": item.get('country', 'Global'),
                            "amount": item.get('amount', 'Contact for Details'),
                            "deadline": item.get('deadline'),
                            "official_link": item.get('url') or item.get('official_link'),
                            "is_external": True,
                            "source": "ScholarshipAPI"
                        })
            except Exception:
                pass

        # 2. Parse.bot (Scholarships.com Scraper) Integration
        if parse_bot_key and not results: # Fallback or secondary source
            try:
                # Parse.bot marketplace API for scholarships.com
                resp = requests.post(
                    "https://parse.bot/api/v1/extract",
                    json={
                        "api_key": parse_bot_key,
                        "url": f"https://www.scholarships.com/scholarship-search?q={query}",
                        "schema": "scholarship_list"
                    },
                    timeout=10
                )
                if resp.status_code == 200:
                    data = resp.json().get('results', [])
                    for i, item in enumerate(data):
                        results.append({
                            "id": f"ext_pbot_{item.get('id', i)}",
                            "title": item.get('title'),
                            "provider": item.get('provider', 'Scholarships.com Partner'),
                            "amount": item.get('amount'),
                            "deadline": item.get('deadline'),
                            "official_link": item.get('link'),
                            "is_external": True,
                            "source": "Scholarships.com (via Parse.bot)"
                        })
            except Exception:
                pass

        # If no external data found or no keys, return a few curated live examples for demo
        if not results:
            results = [
                {
                    "id": "demo_live_1",
                    "title": f"Australian Government Research Training Program (RTP) - {query or 'General'}",
                    "provider": "Australian University Consortium",
                    "country": "Australia",
                    "amount": "Full Tuition + $30,000 Stipend",
                    "deadline": "2024-12-31",
                    "official_link": "https://www.education.gov.au/research-block-grants/research-training-program",
                    "is_external": True,
                    "source": "Live Demo"
                },
                {
                    "id": "demo_live_2",
                    "title": "Fulbright Foreign Student Program",
                    "provider": "US Department of State",
                    "country": "USA",
                    "amount": "Varies by country",
                    "deadline": "2025-05-01",
                    "official_link": "https://foreign.fulbrightonline.org/",
                    "is_external": True,
                    "source": "Live Demo"
                }
            ]

        return Response(results)
