import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const greenIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [32, 32],
});

const HospitalMap = ({ userLocation, hospitals }) => {
  const NEAR_KM = 5;

  return (
    <MapContainer
      center={[userLocation.latitude, userLocation.longitude]}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker
        position={[userLocation.latitude, userLocation.longitude]}
        icon={redIcon}
      >
        <Popup>Your location</Popup>
      </Marker>

      <Circle
        center={[userLocation.latitude, userLocation.longitude]}
        radius={NEAR_KM * 1000}
        pathOptions={{ color: "green" }}
      />

      {hospitals.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={h.distance <= NEAR_KM ? greenIcon : yellowIcon}
        >
          <Popup>
            <strong>{h.name}</strong>
            <br />
            {h.distance} km
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default HospitalMap;
