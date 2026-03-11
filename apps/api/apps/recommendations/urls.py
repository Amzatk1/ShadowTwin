from django.urls import path

from .views import FeedView, RecommendationDismissView, RecommendationPinView

urlpatterns = [
    path("<slug:workspace_slug>/", FeedView.as_view(), name="feed"),
    path("<str:recommendation_id>/dismiss/", RecommendationDismissView.as_view(), name="recommendation-dismiss"),
    path("<str:recommendation_id>/pin/", RecommendationPinView.as_view(), name="recommendation-pin"),
]
