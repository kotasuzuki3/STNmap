import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "./index.css";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [dateRange, setDateRange] = useState({ minDate: new Date(), maxDate: new Date() });

  const filterValidData = (data) => {
    const validData = data.filter((point) => {
      return point.latitude !== null && point.longitude !== null;
    }).map((point) => ({
      ...point, 
      incident_date: new Date(point.incident_date).toISOString().split('T')[0],
    }));
  
    console.log("Valid Data:", validData);
  
    return validData;
  };
  
  const updateHeatmap = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data');
      const jsonData = await response.json();
      const validData = filterValidData(jsonData);
      setHeatmapData(validData);
  
      // Clear previous heatmap layer
      if (heatLayerRef.current) {
        heatLayerRef.current.remove();
      }
  
      // Create a new Leaflet Heatmap layer
      const heatLayer = L.heatLayer(
        validData.map((dataPoint) => [dataPoint.latitude, dataPoint.longitude])
      );
  
      // Add the new heatmap layer to the map
      heatLayer.addTo(mapRef.current);
  
      // Store the reference to the new heatmap layer for future removal
      heatLayerRef.current = heatLayer;
  
      // Update the date range
      const dates = validData.map((point) => new Date(point.incident_date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setDateRange({ minDate, maxDate });

      // Get the selected date from the timeline slider
      const timelineValue = timeSliderRef.current.value;
      const currentTime = new Date(
      minDate.getTime() + (maxDate.getTime() - minDate.getTime()) * (timelineValue / 100)
      );
        
      // Update the time label with the selected date
      const formattedDate = currentTime.toLocaleDateString();
      timeLabelRef.current.textContent = formattedDate;
    
  
      // Filter the heatmap data based on the current time
      const filteredData = validData.filter(
        (dataPoint) => new Date(dataPoint.incident_date) <= currentTime
      );
  
      // Update the heatmap layer with the filtered data
      const heatPoints = filteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
      ]);
      heatLayerRef.current.setLatLngs(heatPoints);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  



  useEffect(() => {
    let map = null;

    const initializeMap = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        const jsonData = await response.json();
        const validData = filterValidData(jsonData);
        setHeatmapData(validData);
    
        map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([37.0902, -95.7129], 4);
    
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
          }
        ).addTo(map);
    
        const heatLayer = L.heatLayer([], {
          radius: 25,
          blur: 15,
        });
        heatLayer.addTo(map);
        
    
        heatLayerRef.current = heatLayer;
        mapRef.current = map;
    
        const logoContainer = L.DomUtil.create("div", "logo-container");
        const logoImage = document.createElement("img");
        logoImage.src =
          "https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg";
        logoContainer.appendChild(logoImage);
        map.getContainer().appendChild(logoContainer);
    
        timeSliderRef.current.addEventListener("input", updateHeatmap);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };
    
    

    initializeMap();

    return () => {
      const timeSlider = timeSliderRef.current;
      timeSlider.removeEventListener("input", updateHeatmap);

      if (mapRef.current) {
        mapRef.current.remove();
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
          onChange={updateHeatmap}
        />
        <label ref={timeLabelRef} id="timeLabel" className="time-label"></label>
      </div>
      <button className="reset-zoom-button" onClick={handleResetZoom}>
        Reset Zoom
      </button>
    </div>
  );
}


