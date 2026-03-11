from django.urls import path

from .views import MeetingListView

urlpatterns = [
    path("", MeetingListView.as_view(), name="meeting-list"),
]
