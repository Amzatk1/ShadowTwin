from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class ProviderScope:
    source_path: str
    display_name: str
    source_type: str = "folder"
    mode: str = "read-only"
    learn_enabled: bool = True


@dataclass(slots=True)
class ProviderEmailMessage:
    sender: str
    recipients: list[str]
    body: str
    sent_at: datetime
    extracted_commitments: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ProviderEmailThread:
    external_id: str
    subject: str
    participants: list[str]
    last_message_at: datetime
    waiting_on: str
    needs_reply: bool
    is_sensitive: bool
    summary: str
    source_url: str
    messages: list[ProviderEmailMessage]


@dataclass(slots=True)
class ProviderMeeting:
    external_id: str
    title: str
    starts_at: datetime
    ends_at: datetime
    participants: list[str]
    priority: str
    summary: str


@dataclass(slots=True)
class ProviderMemoryItem:
    item_type: str
    title: str
    summary: str
    content: str
    source_label: str
    source_object_id: str


@dataclass(slots=True)
class ProviderBundle:
    account_label: str
    scopes: list[ProviderScope]
    email_threads: list[ProviderEmailThread]
    meetings: list[ProviderMeeting]
    memory_items: list[ProviderMemoryItem]
