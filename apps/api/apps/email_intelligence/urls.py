from django.urls import path

from .views import EmailThreadListView

urlpatterns = [
    path("", EmailThreadListView.as_view(), name="email-thread-list"),
]
