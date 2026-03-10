from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Seed a realistic founder demo workspace for ShadowTwin"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Seeded demo workspace: founder-shadow"))
        self.stdout.write("Connected Gmail, Google Calendar, Notion, HubSpot, and Zoom")
        self.stdout.write("Created meetings, threads, memory items, approvals, and workflow suggestions")

