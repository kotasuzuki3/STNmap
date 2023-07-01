import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { addressPoints } from "./addressPoints";
import "./index.css";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView([37.0902, -95.7129], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const heatLayer = L.heatLayer([], { radius: 20 });
    heatLayer.addTo(map);

    mapRef.current = map;
    heatLayerRef.current = heatLayer;

    const timeSlider = timeSliderRef.current;
    const timeLabel = timeLabelRef.current;

    const startDate = new Date("01/01/2023").getTime(); // Start date in milliseconds
    const endDate = new Date("12/31/2023").getTime(); // End date in milliseconds

    const updateHeatmap = () => {
      const currentTime = startDate + ((endDate - startDate) * timeSlider.value) / 100;
      const currentTimePoints = addressPoints.filter(point => {
        const pointTime = new Date(point[2]).getTime();
        return pointTime <= currentTime;
      });

      const heatPoints = currentTimePoints.map(point => [point[0], point[1]]);
      heatLayer.setLatLngs(heatPoints);

      const formattedDate = new Date(currentTime).toLocaleDateString();
      timeLabel.textContent = formattedDate;
    };

    timeSlider.addEventListener("input", updateHeatmap);

    updateHeatmap();

    return () => {
      timeSlider.removeEventListener("input", updateHeatmap);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const timeSliderContainer = document.querySelector(".slider-container");
    const zoomControlContainer = map.zoomControl.getContainer();
    timeSliderContainer.style.top = zoomControlContainer.offsetHeight + "px";
    timeSliderContainer.style.right = "10px";
    map.getPanes().overlayPane.appendChild(timeSliderContainer);
  }, []);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>
      <div className="slider-container">
        <label htmlFor="timeSlider" className="slider-label">
          Time Slider
        </label>
        <input
          ref={timeSliderRef}
          id="timeSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          defaultValue="0"
          className="slider"
        />
        <label ref={timeLabelRef} id="timeLabel" className="time-label"></label>
      </div>
    </div>
  );
}
