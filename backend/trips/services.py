from eldlogs.builder import build_logs
from routing import services as routing_services

from .models import Trip


class TripPlanningError(Exception):
    pass


def plan_trip(current_location, pickup_location, dropoff_location, current_cycle_used):
    try:
        current = routing_services.geocode(current_location)
        pickup = routing_services.geocode(pickup_location)
        dropoff = routing_services.geocode(dropoff_location)
    except routing_services.GeocodingError as exc:
        raise TripPlanningError(str(exc)) from exc

    coordinates = [
        (current["lat"], current["lon"]),
        (pickup["lat"], pickup["lon"]),
        (dropoff["lat"], dropoff["lon"]),
    ]

    try:
        route = routing_services.route(coordinates)
    except routing_services.RoutingError as exc:
        raise TripPlanningError(str(exc)) from exc

    locations = {
        "current": current["label"],
        "pickup": pickup["label"],
        "dropoff": dropoff["label"],
    }

    logs = build_logs(route["legs"], current_cycle_used, locations)

    stops = _build_stops(current, pickup, dropoff, route, logs)

    result = {
        "locations": {
            "current": _point(current),
            "pickup": _point(pickup),
            "dropoff": _point(dropoff),
        },
        "route": {
            "geometry": route["geometry"],
            "distance_miles": round(route["distance_miles"], 1),
            "duration_hours": round(route["duration_hours"], 2),
        },
        "stops": stops,
        "logs": logs,
    }

    trip = Trip.objects.create(
        current_location=current_location,
        pickup_location=pickup_location,
        dropoff_location=dropoff_location,
        current_cycle_used=current_cycle_used,
        total_distance_miles=round(route["distance_miles"], 1),
        total_driving_hours=logs["summary"]["driving_hours"],
        total_days=logs["summary"]["total_days"],
        result=result,
    )

    result["trip_id"] = trip.id
    return result


def _build_stops(current, pickup, dropoff, route, logs):
    stops = [
        {
            "type": "start",
            "label": "Trip start",
            "name": current["label"],
            "lat": current["lat"],
            "lon": current["lon"],
        },
        {
            "type": "pickup",
            "label": "Pickup (1 hr on-duty)",
            "name": pickup["label"],
            "lat": pickup["lat"],
            "lon": pickup["lon"],
        },
        {
            "type": "dropoff",
            "label": "Drop-off (1 hr on-duty)",
            "name": dropoff["label"],
            "lat": dropoff["lat"],
            "lon": dropoff["lon"],
        },
    ]

    counts = {"fuel": 0, "rest": 0, "break": 0}
    for segment in logs.get("timeline", []):
        if segment["label"] == "Fuel stop":
            counts["fuel"] += 1
        elif segment["label"] == "10-hr reset":
            counts["rest"] += 1
        elif segment["label"] == "30-min break":
            counts["break"] += 1

    stops_summary = {
        "fuel_stops": counts["fuel"],
        "rest_periods": counts["rest"],
        "breaks": counts["break"],
    }
    return {"points": stops, "counts": stops_summary}


def _point(location):
    return {
        "label": location["label"],
        "lat": location["lat"],
        "lon": location["lon"],
    }
