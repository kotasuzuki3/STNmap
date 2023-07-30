import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "./index_dashboard.css";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const alaskaHeatLayerRef = useRef(null);
  const hawaiiHeatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);
  const [alaskaMap, setAlaskaMap] = useState(null);
  const [hawaiiMap, setHawaiiMap] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showDashboardContent, setShowDashboardContent] = useState(true);
  const [dashboardVisible, setDashboardVisible] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [dateRange, setDateRange] = useState({ minDate: new Date(), maxDate: new Date() });
  const autoplayIntervalRef = useRef(null);

  const toggleSubmit = () => {
    window.open("https://form.jotform.com/222938481763163", "_blank");
  };

  const handleFeedback = () => {
    window.open("https://form.jotform.com/231036759147055", "_blank");
  };

  const contactUs = () => {
    window.location.href = "mailto:stn@nonopera.org";
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  const toggleMethodology = () => {
    setShowMethodology(!showMethodology);
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

      // Update Alaska map's heat layer
      const alaskaFilteredData = heatmapData.filter(
        (dataPoint) => new Date(dataPoint.incident_date) <= currentTime
      );
      const alaskaHeatPoints = alaskaFilteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);
      alaskaHeatLayerRef.current.setLatLngs(alaskaHeatPoints);

      // Update Hawaii map's heat layer
      const hawaiiFilteredData = heatmapData.filter(
        (dataPoint) => new Date(dataPoint.incident_date) <= currentTime
      );
      const hawaiiHeatPoints = hawaiiFilteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);
      hawaiiHeatLayerRef.current.setLatLngs(hawaiiHeatPoints);

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

      // Filter data for the Alaska map
      const alaskaFilteredData = validData.filter(
        (dataPoint) => new Date(dataPoint.incident_date) <= currentTime && /* Filter for Alaska data */
          dataPoint.latitude >= 54.5 && dataPoint.latitude <= 71.5 && // Latitude range for Alaska
          dataPoint.longitude >= -160 && dataPoint.longitude <= -140 // Longitude range for Alaska
      );

      const alaskaHeatPoints = alaskaFilteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      alaskaHeatLayerRef.current.setLatLngs(alaskaHeatPoints); 


      // Filter data for the Hawaii map
      const hawaiiFilteredData = validData.filter(
        (dataPoint) =>
          new Date(dataPoint.incident_date) <= currentTime &&
          ((dataPoint.latitude >= 18.5 && dataPoint.latitude <= 20.5) || // Latitude range for Hawaii
          (dataPoint.longitude >= -161 && dataPoint.longitude <= -154)) // Longitude range for Hawaii
      );

      const hawaiiHeatPoints = hawaiiFilteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      hawaiiHeatLayerRef.current.setLatLngs(hawaiiHeatPoints);

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
    let alaskaMap;
    let alaskaHeatLayer;
    let hawaiiMap;
    let hawaiiHeatLayer;


    const initializeMap = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        const jsonData = await response.json();
        const validData = filterValidData(jsonData);
      
        setHeatmapData(validData);

        map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([37.0902, -95.7129], 4.4);

        const basemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          minZoom: 3,
        });
        basemapLayer.addTo(map)

        // L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        //   attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        //   minZoom: 3,
        //   maxZoom: 16,
        // }).addTo(map);

        // Initialize the Alaska Map
        alaskaMap = L.map("alaska-map", {
          zoomControl: false,
        }).setView([64.2008, -149.4937], 2); // Coordinates for Alaska

        // Add the same basemap style to the Alaska map
        const alaskaBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        alaskaBasemapLayer.addTo(alaskaMap);
        setAlaskaMap(alaskaMap);

        // Initialize Hawaii map
        hawaiiMap = L.map("hawaii-map", {
          zoomControl: false,
        }).setView([21.3114, -157.7964], 5); 

        const hawaiiBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        hawaiiBasemapLayer.addTo(hawaiiMap);
        setHawaiiMap(hawaiiMap);

        const minDate = new Date(Math.min(...validData.map((point) => new Date(point.incident_date))));
        const maxDate = new Date(Math.max(...validData.map((point) => new Date(point.incident_date))));
        setDateRange({ minDate, maxDate });

        const initialTimelineValue = 0;
        timeSliderRef.current.value = initialTimelineValue;

        heatLayer = L.heatLayer([], {
          radius: 10,
          blur: 3,
          gradient: {
            0.03: "blue",
            0.06: "yellow",
            0.09: "orange",
            0.1: "pink",
            0.15: "red",
          },
        });
        heatLayer.addTo(map);

        mapRef.current = map;
        heatLayerRef.current = heatLayer;

        // Create the heatmap for the Alaska map
        alaskaHeatLayer = L.heatLayer([], { 
          radius: 10,
          blur: 3,
          gradient: {
            0.03: "blue",
            0.06: "yellow",
            0.09: "orange",
            0.1: "pink",
            0.15: "red",
          },
        });
        alaskaHeatLayer.addTo(alaskaMap);
        alaskaHeatLayerRef.current = alaskaHeatLayer;

        hawaiiHeatLayer = L.heatLayer([], {
          radius: 10,
          blur: 3,
          gradient: {
            0.03: "blue",
            0.06: "yellow",
            0.09: "orange",
            0.1: "pink",
            0.15: "red",
          },
        });
        hawaiiHeatLayer.addTo(hawaiiMap);
        hawaiiHeatLayerRef.current = hawaiiHeatLayer;


        timeSliderRef.current.addEventListener("input", updateHeatmap);
        updateHeatmap();
      } catch (error) {
        console.error("Error initializing map:", error);
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
  
    // Reset Alaska map's view
    if (alaskaMap) {
      alaskaMap.setView([64.2008, -149.4937], 2);
    }
  
    // Reset Hawaii map's view
    if (hawaiiMap) {
      hawaiiMap.setView([21.3114, -157.7964], 5);
    }
  };

  return (
    <div className="map-container">
      {/* Menu at the top */}
      <div className="menu">
        <img
          src="https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg"
          alt="Logo"
          className="logo-image"
        />
        <div className="logo-text">SAY THEIR NAMES</div>
        <ul className="menu-item-list">
          <li>
            <a href="#" onClick={toggleMethodology}>
              Methodology
            </a>
          </li>
          <li>
            <a href="#" onClick={toggleAbout}>
              About
            </a>
          </li>
          <li>
            <a href="#" onClick={toggleSubmit}>
              Submit Info
            </a>
          </li>
          <li>
            <a href="#" onClick={contactUs}>
              Contact Us
            </a>
          </li>
          <li>
            <a href="#" onClick={handleFeedback}>
              Feedback
            </a>
          </li>
        </ul>
      </div>
      <div ref={mapRef} className="map"></div>
      <div id="alaska-map" className="alaska-map"></div>
      <div id="hawaii-map" className="hawaii-map"></div>
      {showDashboard && (
        <div className={`dashboard ${dashboardVisible ? "" : "collapsed"}`}>
          <div className="dashboard-header">
            <div className="dashboard-title"></div>
            <img
              src={dashboardVisible ? "https://cdn3.iconfinder.com/data/icons/arrows-219/24/collapse-left-512.png" : "https://cdn.iconscout.com/icon/free/png-256/free-collapse-right-1485695-1258916.png?f=webp"}
              alt={dashboardVisible ? "Collapse" : "Reopen"}
              className="dashboard-icon"
              onClick={toggleDashboard}
              style={{ width: "30px", height: "30px", marginTop: "70px" }}
            />
          </div>
          <div className="logo-container">
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
                    style={{ width: "25px", height: "25px", marginLeft: "-225px", transform: "translateY(-45px)", }}
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
