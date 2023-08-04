import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

export default function PointMap() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Create the leaflet map
    const map = L.map(mapRef.current).setView([40.7128, -74.0060], 10);

    // Add a tile layer (e.g., OpenStreetMap) to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    // Create a marker layer with a custom icon
    const customIcon = L.divIcon({ className: "custom-marker", html: "Big Point" });
    const marker = L.marker([40.7128, -74.0060], { icon: customIcon }).addTo(map);

    // Store the map and marker references in the state
    mapRef.current = map;
    markerRef.current = marker;

    // Clean up when the component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return <div ref={mapRef} className="pointmap-container"></div>;
}
