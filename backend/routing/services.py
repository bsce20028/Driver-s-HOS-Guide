import requests
from django.conf import settings


class GeocodingError(Exception):
    pass


class RoutingError(Exception):
    pass


def geocode(query):
    url = f"{settings.NOMINATIM_URL}/search"
    params = {"q": query, "format": "json", "limit": 1, "addressdetails": 1}
    headers = {"User-Agent": settings.GEOCODER_USER_AGENT}

    try:
        response = requests.get(url, params=params, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise GeocodingError(f"Geocoding request failed: {exc}") from exc

    results = response.json()
    if not results:
        raise GeocodingError(f"No location found for '{query}'.")

    top = results[0]
    return {
        "query": query,
        "label": top.get("display_name", query),
        "lat": float(top["lat"]),
        "lon": float(top["lon"]),
    }


def route(coordinates):
    path = ";".join(f"{lon},{lat}" for lat, lon in coordinates)
    url = f"{settings.OSRM_URL}/route/v1/driving/{path}"
    params = {"overview": "full", "geometries": "geojson", "steps": "false"}

    try:
        response = requests.get(url, params=params, timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RoutingError(f"Routing request failed: {exc}") from exc

    payload = response.json()
    if payload.get("code") != "Ok" or not payload.get("routes"):
        raise RoutingError("No drivable route found between the given locations.")

    leg_route = payload["routes"][0]
    geometry = [[lat, lon] for lon, lat in leg_route["geometry"]["coordinates"]]

    legs = []
    for leg in leg_route.get("legs", []):
        legs.append(
            {
                "distance_miles": _meters_to_miles(leg["distance"]),
                "duration_hours": leg["duration"] / 3600.0,
            }
        )

    return {
        "distance_miles": _meters_to_miles(leg_route["distance"]),
        "duration_hours": leg_route["duration"] / 3600.0,
        "geometry": geometry,
        "legs": legs,
    }


def _meters_to_miles(meters):
    return meters / 1609.344
