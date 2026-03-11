from django.urls import path

from .views import MemoryExcludeLearningView, MemoryHideView, MemoryListView

urlpatterns = [
    path("", MemoryListView.as_view(), name="memory-list"),
    path("<str:memory_id>/hide/", MemoryHideView.as_view(), name="memory-hide"),
    path("<str:memory_id>/exclude-learning/", MemoryExcludeLearningView.as_view(), name="memory-exclude-learning"),
]
