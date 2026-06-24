from dataclasses import dataclass, field

from . import constants as C


@dataclass
class Segment:
    status: str
    start_hour: float
    end_hour: float
    label: str
    location: str = ""

    @property
    def duration(self):
        return self.end_hour - self.start_hour


@dataclass
class PlannerState:
    clock: float = 0.0
    driving_since_break: float = 0.0
    driving_in_shift: float = 0.0
    duty_window_used: float = 0.0
    cycle_used: float = 0.0
    segments: list = field(default_factory=list)


class HOSPlanner:
    def __init__(self, route_legs, current_cycle_used, locations):
        self.legs = route_legs
        self.locations = locations
        self.state = PlannerState(cycle_used=current_cycle_used)

    def plan(self):
        self._on_duty(C.PICKUP_HOURS, "Pickup", self.locations["pickup"])

        total_distance = sum(leg["distance_miles"] for leg in self.legs)
        self._drive_distance(total_distance)

        self._on_duty(C.DROPOFF_HOURS, "Drop-off", self.locations["dropoff"])
        return self.state.segments

    def _drive_distance(self, total_distance):
        remaining = total_distance
        miles_since_fuel = 0.0

        while remaining > 0.01:
            self._ensure_shift_capacity()

            drive_hours_left = min(
                C.MAX_DRIVING_HOURS - self.state.driving_in_shift,
                C.MAX_DUTY_WINDOW_HOURS - self.state.duty_window_used,
                C.DRIVING_BEFORE_BREAK_HOURS - self.state.driving_since_break,
            )

            miles_left_in_chunk = drive_hours_left * C.AVERAGE_SPEED_MPH
            miles_to_fuel = C.FUEL_INTERVAL_MILES - miles_since_fuel
            drive_miles = min(remaining, miles_left_in_chunk, miles_to_fuel)

            if drive_miles <= 0.01:
                self._resolve_block()
                continue

            drive_hours = drive_miles / C.AVERAGE_SPEED_MPH
            self._driving(drive_hours, "Driving")

            remaining -= drive_miles
            miles_since_fuel += drive_miles

            if remaining <= 0.01:
                break

            if miles_since_fuel >= C.FUEL_INTERVAL_MILES - 0.01:
                self._on_duty(C.FUEL_STOP_HOURS, "Fuel stop", "En route")
                miles_since_fuel = 0.0

    def _resolve_block(self):
        s = self.state
        if s.driving_since_break >= C.DRIVING_BEFORE_BREAK_HOURS - 0.01 and (
            s.driving_in_shift < C.MAX_DRIVING_HOURS - 0.01
            and s.duty_window_used < C.MAX_DUTY_WINDOW_HOURS - 0.51
        ):
            self._break(C.REQUIRED_BREAK_HOURS)
        else:
            self._reset_shift()

    def _ensure_shift_capacity(self):
        s = self.state
        if (
            s.driving_in_shift >= C.MAX_DRIVING_HOURS - 0.01
            or s.duty_window_used >= C.MAX_DUTY_WINDOW_HOURS - 0.01
        ):
            self._reset_shift()
            return
        if s.driving_since_break >= C.DRIVING_BEFORE_BREAK_HOURS - 0.01:
            self._break(C.REQUIRED_BREAK_HOURS)

    def _driving(self, hours, label):
        self._append(C.STATUS_DRIVING, hours, label, "En route")
        self.state.driving_since_break += hours
        self.state.driving_in_shift += hours
        self.state.duty_window_used += hours
        self.state.cycle_used += hours

    def _on_duty(self, hours, label, location):
        self._ensure_shift_capacity()
        if self.state.duty_window_used + hours > C.MAX_DUTY_WINDOW_HOURS:
            self._reset_shift()
        self._append(C.STATUS_ON_DUTY, hours, label, location)
        self.state.duty_window_used += hours
        self.state.cycle_used += hours

    def _break(self, hours):
        self._append(C.STATUS_ON_DUTY, hours, "30-min break", "Rest area")
        self.state.duty_window_used += hours
        self.state.cycle_used += hours
        self.state.driving_since_break = 0.0

    def _reset_shift(self):
        self._append(
            C.STATUS_SLEEPER, C.REQUIRED_OFF_DUTY_HOURS, "10-hr reset", "Rest area"
        )
        next_day_start = (int(self.state.clock // 24) + 1) * 24
        carry = next_day_start - self.state.clock
        if 0.01 < carry < 24:
            self._append(C.STATUS_OFF_DUTY, carry, "Off duty", "Rest area")
        self.state.driving_since_break = 0.0
        self.state.driving_in_shift = 0.0
        self.state.duty_window_used = 0.0

    def _append(self, status, hours, label, location):
        start = self.state.clock
        end = start + hours
        self.state.segments.append(
            Segment(
                status=status,
                start_hour=start,
                end_hour=end,
                label=label,
                location=location,
            )
        )
        self.state.clock = end
