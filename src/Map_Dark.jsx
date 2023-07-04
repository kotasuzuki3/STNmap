import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { addressPoints } from "./addressPoints";
import "leaflet/dist/leaflet.css";
import "./index.css";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);

  useEffect(() => {
    let map = null; 

    const initializeMap = () => {
      map = L.map(mapRef.current, {
        zoomControl: false 
      }).setView([37.0902, -95.7129], 4);
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        }
      ).addTo(map);

      const heatLayer = L.heatLayer([], { radius: 55, blur: 40 });
      heatLayer.addTo(map);

      mapRef.current = map;
      heatLayerRef.current = heatLayer;

      const logoContainer = L.DomUtil.create("div", "logo-container");
      const logoImage = document.createElement("img");
      logoImage.src = "https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg";
      logoContainer.appendChild(logoImage);
      map.getContainer().appendChild(logoContainer);

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

  const handleResetZoom = () => {
    const map = mapRef.current;
    map.setView([37.0902, -95.7129], 4);
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
          max="100"
          step="1"
          defaultValue="0"
          className="slider"
        />
        <label ref={timeLabelRef} id="timeLabel" className="time-label"></label>
      </div>
      <button className="reset-zoom-button" onClick={handleResetZoom}>
        Reset Zoom
      </button>
    </div>
  );
}

