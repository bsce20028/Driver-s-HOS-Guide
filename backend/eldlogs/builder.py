from . import constants as C
from .engine import HOSPlanner, Segment


def build_logs(route_legs, current_cycle_used, locations):
    planner = HOSPlanner(route_legs, current_cycle_used, locations)
    segments = planner.plan()

    if not segments:
        return {"days": [], "summary": _empty_summary()}

    total_end = segments[-1].end_hour
    filled = _pad_off_duty(segments, total_end)
    days = _split_into_days(filled, total_end)

    return {
        "days": days,
        "summary": _summary(days, segments, current_cycle_used),
        "timeline": [_serialize(s) for s in segments],
    }


def _pad_off_duty(segments, total_end):
    filled = []
    cursor = 0.0
    for seg in segments:
        if seg.start_hour > cursor + 0.001:
            filled.append(
                Segment(C.STATUS_OFF_DUTY, cursor, seg.start_hour, "Off duty")
            )
        filled.append(seg)
        cursor = seg.end_hour
    day_end = (int(total_end // 24) + 1) * 24
    if cursor < day_end - 0.001:
        filled.append(Segment(C.STATUS_OFF_DUTY, cursor, day_end, "Off duty"))
    return filled


def _split_into_days(filled, total_end):
    day_count = int(total_end // 24) + 1
    days = []

    for day_index in range(day_count):
        day_start = day_index * 24
        day_end = day_start + 24
        rows = []
        for seg in filled:
            overlap_start = max(seg.start_hour, day_start)
            overlap_end = min(seg.end_hour, day_end)
            if overlap_end - overlap_start <= 0.001:
                continue
            rows.append(
                {
                    "status": seg.status,
                    "start": round(overlap_start - day_start, 4),
                    "end": round(overlap_end - day_start, 4),
                    "label": seg.label,
                    "location": seg.location,
                }
            )

        days.append(
            {
                "day_number": day_index + 1,
                "segments": rows,
                "totals": _day_totals(rows),
                "remarks": _day_remarks(rows),
            }
        )
    return days


def _day_totals(rows):
    totals = {
        C.STATUS_OFF_DUTY: 0.0,
        C.STATUS_SLEEPER: 0.0,
        C.STATUS_DRIVING: 0.0,
        C.STATUS_ON_DUTY: 0.0,
    }
    for row in rows:
        totals[row["status"]] += row["end"] - row["start"]
    return {key: round(value, 2) for key, value in totals.items()}


def _day_remarks(rows):
    remarks = []
    for row in rows:
        if row["status"] in (C.STATUS_DRIVING,) and row["label"] == "Driving":
            continue
        if row["status"] == C.STATUS_OFF_DUTY:
            continue
        remarks.append(
            {
                "time": _format_clock(row["start"]),
                "label": row["label"],
                "location": row["location"],
            }
        )
    return remarks


def _summary(days, segments, current_cycle_used):
    drive = sum(s.duration for s in segments if s.status == C.STATUS_DRIVING)
    on_duty = sum(
        s.duration for s in segments if s.status in (C.STATUS_DRIVING, C.STATUS_ON_DUTY)
    )
    return {
        "total_days": len(days),
        "driving_hours": round(drive, 2),
        "on_duty_hours": round(on_duty, 2),
        "starting_cycle_hours": round(current_cycle_used, 2),
        "ending_cycle_hours": round(current_cycle_used + on_duty, 2),
        "cycle_limit": C.CYCLE_LIMIT_HOURS,
    }


def _empty_summary():
    return {
        "total_days": 0,
        "driving_hours": 0.0,
        "on_duty_hours": 0.0,
        "starting_cycle_hours": 0.0,
        "ending_cycle_hours": 0.0,
        "cycle_limit": C.CYCLE_LIMIT_HOURS,
    }


def _serialize(segment):
    return {
        "status": segment.status,
        "start_hour": round(segment.start_hour, 4),
        "end_hour": round(segment.end_hour, 4),
        "label": segment.label,
        "location": segment.location,
    }


def _format_clock(day_hour):
    total_minutes = int(round(day_hour * 60))
    hours = (total_minutes // 60) % 24
    minutes = total_minutes % 60
    suffix = "AM" if hours < 12 else "PM"
    display_hour = hours % 12
    if display_hour == 0:
        display_hour = 12
    return f"{display_hour}:{minutes:02d} {suffix}"
