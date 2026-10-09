from django.urls import path
from .views import (
    AIWriteSOPView, 
    AIReviewSOPView, 
    AIReviewCVView, 
    AICheckEligibilityView,
    AIImprovePostView,
    AILiveSupportView,
    AIGenerateBioView,
    AIMatchmakerView,
    AIChatHistoryView
)

urlpatterns = [
    path('write-sop/', AIWriteSOPView.as_view(), name='ai-write-sop'),
    path('review-sop/', AIReviewSOPView.as_view(), name='ai-review-sop'),
    path('review-cv/', AIReviewCVView.as_view(), name='ai-review-cv'),
    path('check-eligibility/', AICheckEligibilityView.as_view(), name='ai-check-eligibility'),
    path('improve-post/', AIImprovePostView.as_view(), name='ai-improve-post'),
    path('live-support/', AILiveSupportView.as_view(), name='ai-live-support'),
    path('chat-history/', AIChatHistoryView.as_view(), name='ai-chat-history'),
    path('generate-bio/', AIGenerateBioView.as_view(), name='ai-generate-bio'),
    path('matchmaker/', AIMatchmakerView.as_view(), name='ai-matchmaker'),
]
