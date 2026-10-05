"""Regression tests for Groove Hub's 3/2/1 free-sample job flow."""

def test_free_sample_policy_is_fixed():
    from app.main import PACKAGE_TIER_RULES
    assert PACKAGE_TIER_RULES == {
        "beginner": {"free_samples": 3, "label": "Beginner"},
        "intermediate": {"free_samples": 2, "label": "Intermediate"},
        "pro": {"free_samples": 1, "label": "Pro"},
    }


def test_booking_model_has_sample_handoff_fields():
    from app.models import Booking
    for field in ("client_notes", "source_file_url", "is_free_sample", "sample_number"):
        assert hasattr(Booking, field)
