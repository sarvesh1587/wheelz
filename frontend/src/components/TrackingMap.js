/**
 * Live Tracking Map Component
 * File: frontend/src/components/TrackingMap.js
 */

import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const carIcon = new L.DivIcon({
  html: '<div style="font-size: 36px;">🚗</div>',
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pickupIcon = new L.DivIcon({
  html: '<div style="font-size: 30px;">🟢</div>',
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const dropIcon = new L.DivIcon({
  html: '<div style="font-size: 30px;">🔴</div>',
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Auto-center map on driver
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function TrackingMap({
  driverLocation,
  pickup,
  drop,
  onCallDriver,
}) {
  const [eta, setEta] = useState(null);

  // Calculate rough ETA
  useEffect(() => {
    if (driverLocation && pickup) {
      const dist = getDistance(driverLocation, pickup);
      const timeMin = Math.round((dist / 40) * 60); // Assuming 40 km/h
      setEta(timeMin);
    }
  }, [driverLocation, pickup]);

  // Simple distance calculation (Haversine)
  function getDistance(pos1, pos2) {
    const R = 6371;
    const dLat = ((pos2[0] - pos1[0]) * Math.PI) / 180;
    const dLon = ((pos2[1] - pos1[1]) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pos1[0] * Math.PI) / 180) *
        Math.cos((pos2[0] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (!driverLocation) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
        <p className="text-gray-500">📍 Waiting for driver location...</p>
        <p className="text-xs text-gray-400 mt-2">
          Driver will share location before trip starts
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map */}
      <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={driverLocation}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater position={driverLocation} />

          {/* Driver Marker */}
          <Marker position={driverLocation} icon={carIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-sm">🚗 Driver is here</p>
                <button
                  onClick={onCallDriver}
                  className="mt-2 px-4 py-1.5 bg-green-500 text-white text-xs rounded-lg"
                >
                  📞 Call Driver
                </button>
              </div>
            </Popup>
          </Marker>

          {/* Pickup Marker */}
          {pickup && (
            <Marker position={pickup} icon={pickupIcon}>
              <Popup>📍 Pickup Point</Popup>
            </Marker>
          )}

          {/* Drop Marker */}
          {drop && (
            <Marker position={drop} icon={dropIcon}>
              <Popup>🏁 Drop Point</Popup>
            </Marker>
          )}

          {/* Route Line */}
          {pickup && (
            <Polyline
              positions={[driverLocation, pickup]}
              color="#f59e0b"
              weight={4}
              dashArray="10, 10"
              opacity={0.7}
            />
          )}
          {drop && (
            <Polyline
              positions={[pickup || driverLocation, drop]}
              color="#10b981"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      {/* ETA & Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-lg font-bold text-amber-500">
              {driverLocation && pickup
                ? `${getDistance(driverLocation, pickup).toFixed(1)} km`
                : "---"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ETA</p>
            <p className="text-lg font-bold text-amber-500">
              {eta ? `${eta} min` : "---"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-lg font-bold text-green-500 flex items-center justify-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
