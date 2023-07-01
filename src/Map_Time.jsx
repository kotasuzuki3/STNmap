import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { addressPoints } from "./addressPoints";
import "leaflet/dist/leaflet.css";
import "./index.css";
import "leaflet.zoomslider";
import "leaflet-easybutton";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);

  useEffect(() => {
    let map = null; // Declare the map variable

    const initializeMap = () => {
      map = L.map(mapRef.current).setView([37.0902, -95.7129], 4);
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
        const sliderValue = parseInt(timeSlider.value);
        const currentTime = startDate + ((endDate - startDate) * sliderValue) / 100;
        const currentTimePoints = addressPoints.filter(point => {
          const pointTime = point[2];
          return pointTime <= currentTime;
        });

        const heatPoints = currentTimePoints.map(point => [point[0], point[1]]);
        heatLayer.setLatLngs(heatPoints);

        const formattedDate = new Date(currentTime).toLocaleDateString();
        timeLabel.textContent = formattedDate;
      };

      timeSlider.addEventListener("input", updateHeatmap);
      timeSlider.addEventListener("mousedown", () => {
        map.dragging.disable();
      });
      timeSlider.addEventListener("mouseup", () => {
        map.dragging.enable();
      });

      map.on("mousedown", () => {
        const isSliderHovered = timeSlider.matches(":hover");
        if (!isSliderHovered) {
          map.dragging.enable();
        }
      });

      updateHeatmap();
    };

    initializeMap();

    return () => {
      const timeSlider = timeSliderRef.current;

      timeSlider.removeEventListener("input", updateHeatmap);
      timeSlider.removeEventListener("mousedown", () => {
        map.dragging.disable();
      });
      timeSlider.removeEventListener("mouseup", () => {
        map.dragging.enable();
      });

      if (map) {
        map.remove();
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const timeSliderContainer = document.querySelector(".slider-container");

    const updateSliderPosition = () => {
      const mapBounds = map.getContainer().getBoundingClientRect();
      timeSliderContainer.style.top = `${mapBounds.top + 10}px`;
      timeSliderContainer.style.left = `${mapBounds.left}px`;
    };

    const updateSliderOnMove = () => {
      updateSliderPosition();
    };

    map.on("zoomend", updateSliderPosition);
    map.on("move", updateSliderOnMove);

    updateSliderPosition();

    const zoomSliderContainer = L.DomUtil.create("div", "zoom-slider");
    const zoomSliderHandle = L.DomUtil.create("div", "zoom-slider-handle", zoomSliderContainer);
    zoomSliderContainer.appendChild(zoomSliderHandle);
    L.control.zoomslider({ position: "topright" }).addTo(map);

    const zoomInButton = L.DomUtil.create("div", "zoom-in-button");
    zoomInButton.innerHTML = '<i class="fas fa-plus"></i>';
    zoomSliderContainer.appendChild(zoomInButton);

    const zoomOutButton = L.DomUtil.create("div", "zoom-out-button");
    zoomOutButton.innerHTML = '<i class="fas fa-minus"></i>';
    zoomSliderContainer.appendChild(zoomOutButton);

    return () => {
      map.off("zoomend", updateSliderPosition);
      map.off("move", updateSliderOnMove);
    };
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
