from django.db import models


class GrantDecision(models.TextChoices):
    APPROVE = "approve", "Autorizar"
    DENY = "deny", "Recusar"
    REVOKE = "revoke", "Revogar"


LIST_LIMIT = 100
TERM_VERSION = "demo-1"
PERSONAL_GRANT_DURATIONS = (10, 30, 60, 90)
