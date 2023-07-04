import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
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
  }, []);

  useEffect(() => {
    const heatLayer = heatLayerRef.current;
    const timeSlider = timeSliderRef.current;
    const timeLabel = timeLabelRef.current;

    const fetchData = async () => {
      try {
        const response = await fetch("/api/data");
        const data = await response.json();

        const heatPoints = data.map(item => [item.latitude, item.longitude]);
        heatLayer.setLatLngs(heatPoints);

        // Extract incident dates
        const incidentDates = data.map(item => new Date(item.incident_date));

        // Find the min and max incident dates
        const minDate = new Date(Math.min(...incidentDates));
        const maxDate = new Date(Math.max(...incidentDates));

        // Update the time slider properties
        timeSlider.min = minDate.getTime();
        timeSlider.max = maxDate.getTime();
        timeSlider.value = minDate.getTime();

        // Update the time label with the initial date
        const formattedDate = minDate.toLocaleDateString();
        timeLabel.textContent = formattedDate;

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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

    const zoomControlContainer = L.control.zoom({ position: "topleft" }).addTo(map);
    const zoomControlElement = zoomControlContainer.getContainer();

    const zoomInButton = zoomControlElement.getElementsByClassName("leaflet-control-zoom-in")[0];
    const zoomOutButton = zoomControlElement.getElementsByClassName("leaflet-control-zoom-out")[0];

    zoomInButton.innerHTML = "+";
    zoomOutButton.innerHTML = "-";

    const customZoomControls = document.createElement("div");
    customZoomControls.classList.add("custom-zoom-controls");
    customZoomControls.appendChild(zoomInButton);
    customZoomControls.appendChild(zoomOutButton);
    map.getContainer().appendChild(customZoomControls);

    return () => {
      map.off("zoomend", updateSliderPosition);
      map.off("move", updateSliderOnMove);
      zoomControlContainer.remove();
    };
  }, []);

  const handleSliderChange = () => {
    const timeSlider = timeSliderRef.current;
    const timeLabel = timeLabelRef.current;

    const currentTime = parseInt(timeSlider.value);
    const formattedDate = new Date(currentTime).toLocaleDateString();
    timeLabel.textContent = formattedDate;
  };

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
          max="1"
          step="1"
          defaultValue="0"
          className="slider"
          onChange={handleSliderChange}
        />
        <label ref={timeLabelRef} id="timeLabel" className="time-label"></label>
      </div>
    </div>
  );
}
