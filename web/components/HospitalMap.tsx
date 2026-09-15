"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Hospital } from "@/lib/types";
import { hospitalCoords } from "@/lib/geo";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  hospitals: Hospital[];
  center: [number, number];
};

export function HospitalMap({ hospitals, center }: Props) {
  const markers = hospitals
    .map((hospital) => ({
      hospital,
      coords: hospitalCoords(hospital),
    }))
    .filter((item) => item.coords !== null);

  return (
    <div className="map-shell">
      <MapContainer center={center} zoom={11} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ hospital, coords }) => (
          <Marker key={hospital.id} position={coords!} icon={icon}>
            <Popup>
              <strong>{hospital.name}</strong>
              <br />
              {hospital.address ?? "Адрес уточняется"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <p className="map-note">
        Точки на карте — по адресу роддома. Цены и отзывы собраны из открытых
        каталогов и могут меняться — уточняйте в самом роддоме.
      </p>
    </div>
  );
}
