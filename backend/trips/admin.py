from django.contrib import admin

from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "pickup_location",
        "dropoff_location",
        "total_distance_miles",
        "total_days",
        "created_at",
    )
    search_fields = ("pickup_location", "dropoff_location", "current_location")
    readonly_fields = ("result", "created_at")
