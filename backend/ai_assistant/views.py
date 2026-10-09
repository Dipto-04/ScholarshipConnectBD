from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .services import AIService
from .models import AIChatMessage
from .serializers import AIChatMessageSerializer
from accounts.models import Profile
from scholarships.models import Scholarship
from django.utils import timezone

def check_ai_limit(profile):
    """
    Checks if a user has exceeded their daily AI usage limit.
    Pro users: Unlimited
    Free users: 5 operations per day
    """
    if profile.is_currently_pro:
        return True, 0

    today = timezone.now().date()
    
    # Reset count if it's a new day
    if profile.last_ai_reset != today:
        profile.ai_usage_count = 0
        profile.last_ai_reset = today
        profile.save()

    limit = 5
    if profile.ai_usage_count >= limit:
        return False, limit
    
    # Increment usage
    profile.ai_usage_count += 1
    profile.save()
    return True, limit

class AIWriteSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response(
                {"error": f"Daily AI limit reached ({limit}/day). Upgrade to Pro for unlimited access."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'title': scholarship.title,
                'field': scholarship.field,
                'country': scholarship.country
            }
            result = AIService.write_sop(profile, scholarship_data)
            return Response({'sop': result, 'usage': profile.ai_usage_count, 'limit': limit})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIReviewSOPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
        
        sop_text = request.data.get('sop_text')
        if not sop_text:
            return Response({'error': 'SOP text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_sop(sop_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AIReviewCVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)

        cv_text = request.data.get('cv_text')
        if not cv_text:
            return Response({'error': 'CV text is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AIService.review_cv(cv_text)
        return Response({'feedback': result, 'usage': profile.ai_usage_count})

class AICheckEligibilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        scholarship_id = request.data.get('scholarship_id')
        try:
            scholarship = Scholarship.objects.get(id=scholarship_id)
            scholarship_data = {
                'eligibility': scholarship.eligibility
            }
            result = AIService.check_eligibility(profile, scholarship_data)
            return Response({'analysis': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIImprovePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        title = request.data.get('title', 'Community Discussion')
        content = request.data.get('content')
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = AIService.improve_post(content, title)
            return Response({'improved_content': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIChatHistoryView(generics.ListAPIView):
    serializer_class = AIChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIChatMessage.objects.filter(user=self.request.user).order_by('created_at')

class AILiveSupportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message')
        history = request.data.get('history', [])
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save user message
        AIChatMessage.objects.create(user=request.user, message=message, is_user=True)
        
        try:
            result = AIService.live_support(message, history)
            
            # Save AI response
            AIChatMessage.objects.create(user=request.user, message=result, is_user=False)

            return Response({'response': result})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIGenerateBioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.profile
        allowed, limit = check_ai_limit(profile)
        if not allowed:
            return Response({"error": "Daily AI limit reached."}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            result = AIService.generate_bio(profile)
            return Response({'bio': result, 'usage': profile.ai_usage_count})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AIMatchmakerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Safely get profile
            profile, _ = Profile.objects.get_or_create(user=request.user)
            is_pro = profile.is_currently_pro
            
            scholarships = Scholarship.objects.filter(status='active')
            
            recommendations = []
            
            target_countries = [c.strip().lower() for c in (profile.target_countries or "").split(',') if c.strip()]
            pref_fields = [f.strip().lower() for f in f"{profile.major_course}, {profile.research_interests}".split(',') if f.strip()]
            
            for s in scholarships:
                score = 0
                s_country = (s.country or "").lower()
                s_field = (s.field or "").lower()
                
                # Check country match
                for tc in target_countries:
                    if tc in s_country or s_country in tc:
                        score += 50
                        break
                
                # Check field match
                for pf in pref_fields:
                    if pf in s_field or s_field in pf:
                        score += 40
                        break
                
                # Bonus for bio relevance
                if profile.bio and (s.title.lower()[:15] in profile.bio.lower()):
                    score += 10
                
                if score > 0:
                    recommendations.append({
                        'scholarship': {
                            'id': s.id,
                            'title': s.title,
                            'provider': s.provider,
                            'country': s.country,
                            'level': s.level,
                        },
                        'match_score': score if score <= 100 else 100
                    })
            
            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            
            # Pro users get more matches
            limit = 10 if is_pro else 3
            
            return Response({
                'recommendations': recommendations[:limit],
                'profile_summary': f"Matches for {profile.full_name or profile.user.username}.",
                'is_pro_results': is_pro,
                'total_found': len(recommendations)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
