from django.db import models


class Trip(models.Model):
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_used = models.FloatField(default=0.0)

    total_distance_miles = models.FloatField(default=0.0)
    total_driving_hours = models.FloatField(default=0.0)
    total_days = models.PositiveIntegerField(default=0)

    result = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.pickup_location} -> {self.dropoff_location} ({self.created_at:%Y-%m-%d})"
