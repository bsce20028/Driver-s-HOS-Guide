import { useEffect } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { STOP_STYLES } from "../constants";

function makeIcon(color, glyph) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:30px;height:30px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid rgba(255,255,255,0.9);
        box-shadow:0 6px 16px -4px rgba(0,0,0,0.7);
        display:flex;align-items:center;justify-content:center;">
        <span style="transform:rotate(45deg);font-size:13px;font-weight:700;color:#0b1220;">${glyph}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

const GLYPHS = { start: "A", pickup: "P", dropoff: "D" };

function FitBounds({ geometry }) {
  const map = useMap();
  useEffect(() => {
    if (!geometry?.length) return;
    const bounds = L.latLngBounds(geometry);
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [geometry, map]);
  return null;
}

export default function RouteMap({ route, stops, locations }) {
  const geometry = route?.geometry || [];
  const center = geometry[Math.floor(geometry.length / 2)] || [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {geometry.length > 0 && (
        <>
          <Polyline positions={geometry} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
          <Polyline positions={geometry} pathOptions={{ color: "#0284c7", weight: 4, opacity: 1 }} />
        </>
      )}

      {(stops?.points || []).map((stop, idx) => {
        const style = STOP_STYLES[stop.type] || STOP_STYLES.start;
        return (
          <Marker
            key={idx}
            position={[stop.lat, stop.lon]}
            icon={makeIcon(style.color, GLYPHS[stop.type] || "•")}
          >
            <Popup>
              <strong>{style.label}</strong>
              <br />
              {stop.name}
            </Popup>
          </Marker>
        );
      })}

      <FitBounds geometry={geometry} />
    </MapContainer>
  );
}
