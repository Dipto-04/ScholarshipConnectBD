from django.urls import path
from .views import (
    SavedScholarshipListCreateView,
    SavedScholarshipDestroyView,
    ScholarshipApplicationListCreateView,
    UserDocumentListCreateView,
    DocumentDetailView,
    ScholarshipApplicationUpdateView,
    ApplicationDocumentRemoveView
)

urlpatterns = [
    path('', ScholarshipApplicationListCreateView.as_view(), name='scholarship-application-list'),
    path('saved/', SavedScholarshipListCreateView.as_view(), name='saved-scholarships'),
    path('saved/<int:pk>/', SavedScholarshipDestroyView.as_view(), name='saved-scholarship-delete'),
    path('apply/', ScholarshipApplicationListCreateView.as_view(), name='scholarship-apply'),
    path('apply/<int:pk>/', ScholarshipApplicationUpdateView.as_view(), name='scholarship-application-update'),
    path('apply/<int:pk>/documents/<int:doc_id>/', ApplicationDocumentRemoveView.as_view(), name='application-document-remove'),
    path('documents/', UserDocumentListCreateView.as_view(), name='user-documents'),
    path('documents/<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
]
