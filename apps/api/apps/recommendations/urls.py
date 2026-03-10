from django.urls import path

from .views import FeedView

urlpatterns = [
    path("<slug:workspace_slug>/", FeedView.as_view(), name="feed"),
]

