from abc import ABC, abstractmethod

from .types import ProviderEmailThread, ProviderMeeting


class OAuthProviderAdapter(ABC):
    @abstractmethod
    def get_auth_url(self, *, state: str, scopes: list[str]) -> str:
        raise NotImplementedError

    @abstractmethod
    def exchange_code(self, *, code: str) -> dict:
        raise NotImplementedError

    @abstractmethod
    def refresh_access_token(self, *, refresh_token: str) -> dict:
        raise NotImplementedError

    @abstractmethod
    def fetch_account_profile(self, *, access_token: str) -> dict:
        raise NotImplementedError


class EmailProviderAdapter(ABC):
    @abstractmethod
    def fetch_recent_threads(
        self,
        *,
        access_token: str,
        max_results: int = 20,
        sync_state: dict | None = None,
    ) -> tuple[list[ProviderEmailThread], dict]:
        raise NotImplementedError


class CalendarProviderAdapter(ABC):
    @abstractmethod
    def fetch_upcoming_events(
        self,
        *,
        access_token: str,
        max_results: int = 20,
        sync_state: dict | None = None,
    ) -> tuple[list[ProviderMeeting], dict]:
        raise NotImplementedError
