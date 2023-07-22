import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "./index_dashboard.css";
import { read } from 'shapefile';

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showDashboardContent, setShowDashboardContent] = useState(true);
  const [dashboardVisible, setDashboardVisible] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [dateRange, setDateRange] = useState({ minDate: new Date(), maxDate: new Date() });
  const autoplayIntervalRef = useRef(null);

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  const toggleMethodology = () => {
    setShowMethodology(!showMethodology);
  };

  const loadStateBoundaries = async () => {
    try {
      // Read the Shapefile data
      const stateShapefile = await read('/Users/kotasuzuki/Desktop/non-opera stn/stn-app/tl_rd22_us_state/tl_rd22_us_state.shp');

      // Convert the Shapefile data to GeoJSON format
      const stateGeoJSON = {
        type: 'FeatureCollection',
        features: stateShapefile.features.map((feature) => ({
          type: 'Feature',
          geometry: feature.geometry,
          properties: feature.properties,
        })),
      };

      // Create a new Leaflet GeoJSON layer from the GeoJSON data
      const stateLayer = L.geoJSON(stateGeoJSON, {
        style: {
          color: 'white', // Change the color of the state outlines as needed
          weight: 100, // Change the weight of the outlines as needed
          fillOpacity: 100, // Set fillOpacity to 0 to make the outlines transparent
        },
      });

      // Add the state outlines layer to the map
      stateLayer.addTo(mapRef.current);

      return stateLayer; // Return the layer so we can store it in the stateLayerRef variable
    } catch (error) {
      console.error('Error loading state boundaries:', error);
    }
  };

  const toggleDashboard = () => {
    if (showDashboard) {
      setDashboardVisible(false);
    } else {
      setDashboardVisible(true);
    }
    setShowDashboard(!showDashboard);
  };

  const handleAutoplay = () => {
    if (autoplay) {
      clearInterval(autoplayIntervalRef.current);
    } else {
      startAutoplay();
    }
    setAutoplay(!autoplay);
  };

  const startAutoplay = () => {
    const minDate = dateRange.minDate;
    const maxDate = dateRange.maxDate;
    const timelineValue = timeSliderRef.current.value;
    const endTime = maxDate.getTime();
    const step = (endTime - minDate.getTime()) / 100;
    const intervalDuration = 250;

    let currentTime = minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * timelineValue) / 100;
    let currentPercentage = timelineValue;
    clearInterval(autoplayIntervalRef.current);

    autoplayIntervalRef.current = setInterval(() => {
      currentTime += step;
      currentPercentage = ((currentTime - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;

      if (currentTime >= endTime) {
        currentTime = minDate.getTime();
        currentPercentage = 0;
        clearInterval(autoplayIntervalRef.current);
        setAutoplay(false);
      }

      if (timeLabelRef.current) {
        const currentDateTime = new Date(currentTime);
        const formattedDate = currentDateTime.toLocaleDateString();
        timeLabelRef.current.textContent = formattedDate;
      }

      timeSliderRef.current.value = currentPercentage;

      const filteredData = heatmapData.filter((dataPoint) => new Date(dataPoint.incident_date) <= currentTime);

      const heatPoints = filteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      heatLayerRef.current.setLatLngs(heatPoints);
    }, intervalDuration);
  };

  const filterValidData = (data) => {
    const validData = data
      .filter((point) => point.latitude !== null && point.longitude !== null)
      .map((point) => ({
        ...point,
        incident_date: new Date(point.incident_date).toISOString().split("T")[0],
      }));

    return validData;
  };

  const updateHeatmap = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/data");
      const jsonData = await response.json();
      const validData = filterValidData(jsonData);
      setHeatmapData(validData);

      if (heatLayerRef.current) {
        heatLayerRef.current.remove();
      }

      const heatLayer = L.heatLayer(
        validData.map((dataPoint) => [
          dataPoint.latitude,
          dataPoint.longitude,
          dataPoint.intensity,
        ]),
        {
          radius: 10,
          blur: 3,
          gradient: {
            0.03: "blue",
            0.06: "cyan",
            0.09: "yellow",
            0.1: "orange",
            0.15: "red",
          },
        }
      );


      heatLayer.addTo(mapRef.current);
      heatLayerRef.current = heatLayer;

      const dates = validData.map((point) => new Date(point.incident_date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      setDateRange({ minDate, maxDate });

      const timelineValue = timeSliderRef.current.value;
      const currentTime = minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * timelineValue) / 100;

      if (showDashboard && timeLabelRef.current) {
        const currentDateTime = new Date(currentTime);
        const formattedDate = currentDateTime.toLocaleDateString();
        timeLabelRef.current.textContent = formattedDate;
      }

      const filteredData = validData.filter((dataPoint) => new Date(dataPoint.incident_date) <= currentTime);

      const heatPoints = filteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      heatLayerRef.current.setLatLngs(heatPoints);

      if (autoplay) {
        startAutoplay();
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    let map;
    let heatLayer;
    let stateLayer; 

    const initializeMap = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        const jsonData = await response.json();
        const validData = filterValidData(jsonData);
        setHeatmapData(validData);

        map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([37.0902, -95.7129], 4.4);

        L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          minZoom: 3,
          maxZoom: 16,
        }).addTo(map);

        loadStateBoundaries();

        const minDate = new Date(Math.min(...validData.map((point) => new Date(point.incident_date))));
        const maxDate = new Date(Math.max(...validData.map((point) => new Date(point.incident_date))));
        setDateRange({ minDate, maxDate });

        const initialTimelineValue = 0;
        timeSliderRef.current.value = initialTimelineValue;

        heatLayer = L.heatLayer([], {
          radius: 25,
          blur: 15,
          gradient: {
            0.03: "blue",
            0.06: "cyan",
            0.09: "yellow",
            0.1: "orange",
            0.15: "red",
          },
        });
        heatLayer.addTo(map);

        mapRef.current = map;
        heatLayerRef.current = heatLayer;

        stateLayer = await addStateOutlinesLayer();

        timeSliderRef.current.addEventListener("input", updateHeatmap);
        updateHeatmap();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    const addStateOutlinesLayer = async () => {
      try {
        // Read the Shapefile data
        const stateShapefile = await read('/Users/kotasuzuki/Desktop/non-opera stn/stn-app/tl_rd22_us_state/tl_rd22_us_state.shp');
  
        // Convert the Shapefile data to GeoJSON format
        const stateGeoJSON = {
          type: 'FeatureCollection',
          features: stateShapefile.features.map((feature) => ({
            type: 'Feature',
            geometry: feature.geometry,
            properties: feature.properties,
          })),
        };
  
        // Create a new Leaflet GeoJSON layer from the GeoJSON data
        const stateLayer = L.geoJSON(stateGeoJSON, {
          style: {
            color: 'white', // Change the color of the state outlines as needed
            weight: 100, // Change the weight of the outlines as needed
            fillOpacity: 100, // Set fillOpacity to 0 to make the outlines transparent
          },
        });
  
        // Add the state outlines layer to the map
        stateLayer.addTo(map);
  
        return stateLayer; // Return the layer so we can store it in the stateLayer variable
      } catch (error) {
        console.error('Error adding state outlines layer:', error);
      }
    };

    initializeMap();

    return () => {
      const timeSlider = timeSliderRef.current;
      timeSlider.removeEventListener("input", updateHeatmap);

      if (map && heatLayer) {
        map.remove();
        heatLayerRef.current = null;
      }
    };
  }, []);

  const handleResetZoom = () => {
    const map = mapRef.current;
    map.setView([37.0902, -95.7129], 4.4);
  };

  return (
    <div className="map-container">
      <div ref={mapRef} className="map"></div>
      {showDashboard && (
        <div className={`dashboard ${dashboardVisible ? "" : "collapsed"}`}>
          <div className="dashboard-header">
            <div className="dashboard-title"></div>
            <img
              src={dashboardVisible ? "https://cdn3.iconfinder.com/data/icons/arrows-219/24/collapse-left-512.png" : "https://cdn.iconscout.com/icon/free/png-256/free-collapse-right-1485695-1258916.png?f=webp"}
              alt={dashboardVisible ? "Collapse" : "Reopen"}
              className="dashboard-icon"
              onClick={toggleDashboard}
              style={{ width: "25px", height: "25px" }}
            />
          </div>
          <div className="logo-container">
            <img
              src="https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg"
              alt="Logo"
              className="logo-image"
            />
          </div>
          <div className="say-their-names-container">
                <div className="say-their-names-line1">SAY</div>
                <div className="say-their-names-line2">THEIR</div>
                <div className="say-their-names-line3">NAMES</div>
          </div>
          {showDashboardContent && (
            <div className="dashboard-content">
              <div className="dashboard-section">
                <div className="dashboard-section-title"></div>
                <div className="dashboard-section-content">
                  <img
                    src="https://cdn.icon-icons.com/icons2/1863/PNG/512/zoom-out-map_118446.png"
                    alt="Reset Zoom"
                    className="dashboard-icon"
                    onClick={handleResetZoom}
                    style={{ width: "25px", height: "25px", marginLeft: "-200px", marginTop: "10px" }}
                  />
                </div>
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-title"></div>
                <div className="dashboard-section-content">
                  <img
                    src="https://www.iconpacks.net/icons/1/free-information-icon-348-thumb.png"
                    alt="About"
                    className="dashboard-icon"
                    onClick={toggleAbout}
                    style={{ width: "30px", height: "30px", marginLeft: "-200px", marginTop: "5px" }}
                  />
                </div>
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-title"></div>
                <div className="dashboard-section-content">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/6345/6345343.png"
                    alt="Methodology"
                    className="dashboard-icon"
                    onClick={toggleMethodology}
                    style={{ width: "38px", height: "38px", marginLeft: "-195px", marginTop: "0px" }}
                  />
                </div>
              </div>
              <div className="dashboard-section">
                <div className="dashboard-section-title">Time Slider</div>
                <div className="dashboard-section-content">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue="0"
                    className="time-slider"
                    ref={timeSliderRef}
                    onChange={updateHeatmap}
                  />
                  <div className="time-label" ref={timeLabelRef}></div>
                  <img
                    src={autoplay ? "https://www.pngall.com/wp-content/uploads/5/Pause-Button-Transparent.png" : "https://cdn-icons-png.flaticon.com/512/2/2287.png"}
                    alt="Play/Pause"
                    className={`autoplay-icon ${autoplay ? "active" : ""}`}
                    onClick={handleAutoplay}
                    style={{ width: "25px", height: "25px" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!showDashboard && (
        <div className="dashboard collapsed">
          <div className="dashboard-header">
            <div className="dashboard-title"></div>
            <img
              src="https://cdn.iconscout.com/icon/free/png-256/free-collapse-right-1485695-1258916.png?f=webp"
              alt="Reopen"
              className="dashboard-icon"
              onClick={toggleDashboard}
              style={{ width: "25px", height: "25px" }}
            />
          </div>
          <div className="dashboard-content"></div>
        </div>
      )}
      {showAbout && (
        <div className="popup">
          <div className="popup-content">
            <p>
              SAY THEIR NAMES is an ongoing research and mapping project, intended to identify and remember Black Americans
              killed by police violence since 1919. It is designed with an open-ended timeline to permit several successive
              years of research, the concurrent development of an interactive map, and the accumulation of community contributions.
              This map is truly a participatory and interactive project. In the coming months and years as we continue to accumulate
              research data and develop the online interactive map, we will add the capability to submit data through an online form.
            </p>
            <p>
              For now, please email us if you have additional information on a currently listed Black American, or with additional
              names that should be included in the map. You may also fill out a form on our website{" "}
              <a href="https://form.jotform.com/222938481763163">HERE</a>.
            </p>
            <p>
              To find out more about SAY THEIR NAMES, including research methodology, current and past researchers, and how you can participate,
              please visit the <a href="https://www.nonopera.org/WP2/voices/say-their-names/">SAY THEIR NAMES webpage</a>.
            </p>
            <p>
              SAY THEIR NAMES was formally launched in January 2021, and currently is staffed by a Lead Researcher-Supervisor, Ronald Browne;
              a Project Manager, Dr. Saba Ayman-Nolley; Northeastern Illinois University academic supervisor for map development, Ting Liu;
              two Northeastern Illinois University interns, research assistant Nozanin (Noza) Farrukhzoda and map developer Robert (Rob) Strzok;
              and two volunteer community Research Assistants, Omid Nolley and Safira Newton-Matza. In addition, NON:op’s creative director,
              Christophe Preissing, is assisting with the map development.
            </p>
            <p>
              For more information, please email us at <a href="mailto:stn@nonopera.org">stn@nonopera.org</a>.
            </p>
          </div>
        </div>
      )}
      {showMethodology && (
        <div className="popup">
          <div className="popup-content">
            <p>
              SAY THEIR NAMES documents incidents that likely would not have resulted in the death of white Americans given
              the same set of circumstances. Each reported case is examined against certain criteria as our focus for the
              project is on those who are clearly innocent victims of police brutality, such as those with no drawn active
              weapons or those not being actively pursued due to unlawful actions or other complexities.
            </p>
            <p>
              For detailed information on our methodology{" "}
              <a href="https://www.nonopera.org/WP2/voices/say-their-names/documents-stn/">click here</a>.
            </p>
          </div>
        </div>
      )}
      <img
        src="https://cdn.iconscout.com/icon/free/png-256/free-collapse-right-1485695-1258916.png?f=webp"
        alt="Reopen"
        className="reopen-button"
        onClick={toggleDashboard}
        style={{ width: "25px", height: "25px", marginLeft: "-30px", marginTop: "0px" }}
      />
    </div>
  );
}
