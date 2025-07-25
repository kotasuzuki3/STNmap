import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "./index.css";
import logo from "./assets/logo.png";
import ReactSlider from "react-slider";

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
  const [activeButton, setActiveButton] = useState("");
  const autoplayIntervalRef = useRef(null);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState([0, 100]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const isMobile = window.matchMedia(
    "(max-device-width: 768px), (max-width: 768px) and (orientation: portrait), (max-height: 500px)"
  ).matches;
  const [minimapsVisible, setMinimapsVisible] = useState(!isMobile);
  const initialZoom = isMobile ? 3 : 5;

  const states = [...new Set(heatmapData.map((point) => point.state))].sort();
  const [pendingState, setPendingState] = useState("All");
  const [pendingGender, setPendingGender] = useState("All");
  const [pendingAgeRange, setPendingAgeRange] = useState([0, 100]);
  const [currentTimelineValue, setCurrentTimelineValue] = useState(100);

  const stateCoordinates = {
    AL: { lat: 32.806671, lon: -86.791130 },
    AK: { lat: 61.370716, lon: -152.404419 },
    AZ: { lat: 33.729759, lon: -111.431221 },
    AR: { lat: 34.969704, lon: -92.373123 },
    CA: { lat: 36.116203, lon: -119.681564 },
    CO: { lat: 39.059811, lon: -105.311104 },
    CT: { lat: 41.597782, lon: -72.755371 },
    DC: { lat: 38.89511, lon: -77.03637 },
    DE: { lat: 39.318523, lon: -75.507141 },
    FL: { lat: 27.766279, lon: -81.686783 },
    GA: { lat: 33.040619, lon: -83.643074 },
    HI: { lat: 21.094318, lon: -157.498337 },
    ID: { lat: 44.240459, lon: -114.478828 },
    IL: { lat: 40.349457, lon: -88.986137 },
    IN: { lat: 39.849426, lon: -86.258278 },
    IA: { lat: 42.011539, lon: -93.210526 },
    KS: { lat: 38.526600, lon: -96.726486 },
    KY: { lat: 37.668140, lon: -84.670067 },
    LA: { lat: 31.169546, lon: -91.867805 },
    ME: { lat: 44.693947, lon: -69.381927 },
    MD: { lat: 39.063946, lon: -76.802101 },
    MA: { lat: 42.230171, lon: -71.530106 },
    MI: { lat: 43.326618, lon: -84.536095 },
    MN: { lat: 45.694454, lon: -93.900192 },
    MS: { lat: 32.741646, lon: -89.678696 },
    MO: { lat: 38.456085, lon: -92.288368 },
    MT: { lat: 46.921925, lon: -110.454353 },
    NE: { lat: 41.125370, lon: -98.268082 },
    NV: { lat: 38.313515, lon: -117.055374 },
    NH: { lat: 43.452492, lon: -71.563896 },
    NJ: { lat: 40.298904, lon: -74.521011 },
    NM: { lat: 34.840515, lon: -106.248482 },
    NY: { lat: 42.165726, lon: -74.948051 },
    NC: { lat: 35.630066, lon: -79.806419 },
    ND: { lat: 47.528912, lon: -99.784012 },
    OH: { lat: 40.388783, lon: -82.764915 },
    OK: { lat: 35.565342, lon: -96.928917 },
    OR: { lat: 44.572021, lon: -122.070938 },
    PA: { lat: 40.590752, lon: -77.209755 },
    RI: { lat: 41.680893, lon: -71.511780 },
    SC: { lat: 33.856892, lon: -80.945007 },
    SD: { lat: 44.299782, lon: -99.438828 },
    TN: { lat: 35.747845, lon: -86.692345 },
    TX: { lat: 31.054487, lon: -97.563461 },
    UT: { lat: 40.150032, lon: -111.862434 },
    VT: { lat: 44.045876, lon: -72.710686 },
    VA: { lat: 37.769337, lon: -78.169968 },
    WA: { lat: 47.400902, lon: -121.490494 },
    WV: { lat: 38.491226, lon: -80.954032 },
    WI: { lat: 44.268543, lon: -89.616508 },
    WY: { lat: 42.755966, lon: -107.302490 },
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
        }).setView([40.0902, -100.7129], initialZoom);

        const basemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          minZoom: 3,
        });
        basemapLayer.addTo(map)

        // Initialize the Alaska Map
        alaskaMap = L.map("alaska-map", {
          zoomControl: false,
          attributionControl: false
        }).setView([64.2008, -149.4937], 2); 

        const alaskaBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        alaskaBasemapLayer.addTo(alaskaMap);
        setAlaskaMap(alaskaMap);

        setTimeout(() => {
          alaskaMap.invalidateSize();
        }, 0);

        // Initialize Hawaii map
        hawaiiMap = L.map("hawaii-map", {
          zoomControl: false,
          attributionControl: false
        }).setView([21.3114, -157.7964], 5); 

        const hawaiiBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        hawaiiBasemapLayer.addTo(hawaiiMap);
        setHawaiiMap(hawaiiMap);

        setTimeout(() => {
          hawaiiMap.invalidateSize();
        }, 0);

        const minDate = new Date("2010-01-01");
        const maxDate = new Date(Math.max(...validData.map((point) => new Date(point.incident_date))));
        setDateRange({ minDate, maxDate });

        const initialTimelineValue = 100;
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

        updateHeatmap();
        setMapInitialized(true);
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();

    // return () => {
    //   removeHeatLayers();
    //   const timeSlider = timeSliderRef.current;
    //   if (timeSlider) {
    //     timeSlider.addEventListener("input", updateHeatmap);
    //   }

    //   if (map && heatLayer) {
    //     map.remove();
    //     heatLayerRef.current = null;
    //   }

    //   if (alaskaMap && alaskaHeatLayer) {
    //     alaskaMap.remove();
    //     alaskaHeatLayerRef.current = null;
    //   }

    //   if (hawaiiMap && hawaiiHeatLayer) {
    //     hawaiiMap.remove();
    //     hawaiiHeatLayerRef.current = null;
    //   }
    // };

  }, []);
  

  const applyFilters = () => {
    let map = mapRef.current

    setSelectedState(pendingState);

    if (pendingState !== 'All' && pendingState in stateCoordinates) {
      map.setView([stateCoordinates[pendingState].lat, stateCoordinates[pendingState].lon], initialZoom);
    } else {
      map.setView([40.0902, -100.7129], initialZoom);
    }

    setSelectedGender(pendingGender);
    setSelectedAgeRange(pendingAgeRange);
    updateHeatmap();
  };

  const resetFilters = () => {
    let map = mapRef.current
    setPendingState("All");
    setSelectedState("All"); 
    map.setView([40.0902, -100.7129], initialZoom);
    setPendingGender("All");
    setPendingAgeRange([0, 100]);
    setSelectedGender("All"); 
    setSelectedAgeRange([0, 100]); 

    updateHeatmap(); 
  };

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
    setShowMethodology(false);
    setActiveButton((prev) => (prev === "about" ? "" : "about")); 
  };

  const toggleMethodology = () => {
    setShowMethodology(!showMethodology);
    setShowAbout(false);
    setActiveButton((prev) => (prev === "methodology" ? "" : "methodology"));
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
    const minDate = new Date("2010-01-01");
    const maxDate = dateRange.maxDate;
    const timelineValue = timeSliderRef.current.value;
    const endTime = maxDate.getTime();
    const step = (endTime - minDate.getTime()) / 100;
    const intervalDuration = 250;
  
    let currentTime = minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * timelineValue) / 100;
    let currentPercentage = timelineValue;
    clearInterval(autoplayIntervalRef.current);
  
    autoplayIntervalRef.current = setInterval(() => {
      if (!mapRef.current || !heatLayerRef.current || !alaskaHeatLayerRef.current || !hawaiiHeatLayerRef.current) {
        clearInterval(autoplayIntervalRef.current);
        setAutoplay(false);
        return;
      }
  
      currentTime += step;
      currentPercentage = ((currentTime - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;
  
      if (currentTime >= endTime) {
        clearInterval(autoplayIntervalRef.current);
        setAutoplay(false);
      }
  
      if (timeSliderRef.current && timeLabelRef.current) {
        const currentDateTime = new Date(currentTime);
        const formattedDate = currentDateTime.toLocaleDateString();
      
        setCurrentTimelineValue(currentPercentage);
        timeLabelRef.current.textContent = formattedDate;
      } else {
        clearInterval(autoplayIntervalRef.current);
        setAutoplay(false);
      }
  
      if (timeSliderRef.current) {
        setCurrentTimelineValue(currentPercentage);
      }
  
      try {
        const filteredData = heatmapData.filter(
          (dataPoint) => new Date(dataPoint.incident_date) <= currentTime &&
          (selectedState === "All" || dataPoint.state === selectedState) &&
          (selectedGender === "All" || dataPoint.gender === selectedGender) &&
          (dataPoint.age >= selectedAgeRange[0] && dataPoint.age <= selectedAgeRange[1])
        );
  
        const heatPoints = filteredData.map(point => [
          parseFloat(point.latitude), parseFloat(point.longitude), point.intensity
        ]);
  
        const alaskaFilteredData = filteredData.filter(
          dataPoint => new Date(dataPoint.incident_date) <= currentTime &&
            dataPoint.latitude >= 54.5 && dataPoint.latitude <= 71.5 &&
            dataPoint.longitude >= -160 && dataPoint.longitude <= -140
        );
  
        const alaskaHeatPoints = alaskaFilteredData.map(point => [
          parseFloat(point.latitude), parseFloat(point.longitude), point.intensity
        ]);
  
        const hawaiiFilteredData = filteredData.filter(
          dataPoint => new Date(dataPoint.incident_date) <= currentTime &&
            ((dataPoint.latitude >= 18.5 && dataPoint.latitude <= 20.5) ||
              (dataPoint.longitude >= -161 && dataPoint.longitude <= -154))
        );
  
        const hawaiiHeatPoints = hawaiiFilteredData.map(point => [
          parseFloat(point.latitude), parseFloat(point.longitude), point.intensity
        ]);
  
        if (heatLayerRef.current && alaskaHeatLayerRef.current && hawaiiHeatLayerRef.current) {
          heatLayerRef.current.setLatLngs(heatPoints);
          alaskaHeatLayerRef.current.setLatLngs(alaskaHeatPoints);
          hawaiiHeatLayerRef.current.setLatLngs(hawaiiHeatPoints);
        } else {
          console.error("One or more map layers are not initialized correctly.");
          clearInterval(autoplayIntervalRef.current);
          setAutoplay(false);
        }
      } catch (error) {
        console.error("Error setting map properties:", error);
        clearInterval(autoplayIntervalRef.current);
        setAutoplay(false);
      }
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
          blur: 1,
          gradient: {
            0.05: "blue",
            0.1: "cyan",
            0.15: "yellow",
            0.2: "orange",
            0.25: "red",
          },
        }
      );


      heatLayer.addTo(mapRef.current);
      heatLayerRef.current = heatLayer;

      const dates = validData.map((point) => new Date(point.incident_date));
      const minDate = new Date("2010-01-01");
      const maxDate = new Date(Math.max(...dates));
      setDateRange({ minDate, maxDate });

      const timelineValue = timeSliderRef.current.value;
      const currentTime = minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * timelineValue) / 100;

      if (showDashboard && timeLabelRef.current) {
        const currentDateTime = new Date(currentTime);
        const formattedDate = currentDateTime.toLocaleDateString();
        timeLabelRef.current.textContent = formattedDate;
      }

      const filteredData = validData
        .filter((dataPoint) => new Date(dataPoint.incident_date) <= currentTime)
        .filter(
          (dataPoint) =>
            (selectedState === "All" || dataPoint.state === selectedState) &&
            (selectedGender === "All" || dataPoint.gender === selectedGender)
        )
        .filter((dataPoint) => {
          const age = dataPoint.age;
          return age >= selectedAgeRange[0] && age <= selectedAgeRange[1];
        });

      const heatPoints = filteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      heatLayerRef.current.setLatLngs(heatPoints);

      // Filter data for the Alaska map
      const alaskaFilteredData = validData.filter(
        (dataPoint) => new Date(dataPoint.incident_date) <= currentTime && 
          dataPoint.latitude >= 54.5 && dataPoint.latitude <= 71.5 && 
          dataPoint.longitude >= -160 && dataPoint.longitude <= -140 
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
          ((dataPoint.latitude >= 18.5 && dataPoint.latitude <= 20.5) || 
          (dataPoint.longitude >= -161 && dataPoint.longitude <= -154)) 
      );

      const hawaiiHeatPoints = hawaiiFilteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      hawaiiHeatLayerRef.current.setLatLngs(hawaiiHeatPoints);

      if (autoplay && showDashboard) {
        startAutoplay();
      }

      
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    if (mapInitialized) {
      updateHeatmap();
    }
  }, [selectedState, selectedGender, selectedAgeRange]);

  const handleResetZoom = () => {
    const map = mapRef.current;
    map.setView([40.0902, -100.7129], initialZoom);
  
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
      <div className="menu">
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
        />
        <div className="logo-text">SAY THEIR NAMES</div>
        <ul className="menu-item-list">
          <li>
            <a href="#" onClick={toggleMethodology} className={activeButton === "methodology" ? "active" : ""}>
              Methodology
            </a>
          </li>
          <li>
            <a href="#" onClick={toggleAbout} className={activeButton === "about" ? "active" : ""}>
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
              style={{ width: "30px", height: "30px", marginTop: "0px" }}
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
                    className="reset-zoom-button"
                    onClick={handleResetZoom}
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
                    value={currentTimelineValue}
                    className="time-slider"
                    ref={timeSliderRef}
                    onChange={(e) => {
                      setCurrentTimelineValue(e.target.value);
                      updateHeatmap(parseFloat(e.target.value));
                    }}
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
                <br></br>
                <div className="filters">
        <div className="filter">
          <label htmlFor="stateFilter">Select State:  </label>
            <select
              id="stateFilter"
              value={pendingState}
              onChange={(e) => setPendingState(e.target.value)}
            >
              <option value="All">All</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
        </div>
        <div className="filter">
          <label htmlFor="genderFilter">Select Gender:  </label>
  <select
    id="genderFilter"
    value={pendingGender}
    onChange={(e) => setPendingGender(e.target.value)}
  >
    <option value="All">All</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
  </select>
        </div>
        <br></br>
        <div className="filter">
  <div className="range-slider">
  <label htmlFor="ageRangeFilter">Select Age Range:</label>
  <ReactSlider
    className="age-range-slider"
    thumbClassName="thumb"
    trackClassName="track"
    value={pendingAgeRange}
    min={0}
    max={100}
    onChange={(value) => setPendingAgeRange(value)}
    pearling
    minDistance={1}
  />
  <div className="range-values">
    {pendingAgeRange[0]} - {pendingAgeRange[1]} years
  </div>
</div>
  <br></br>
  <div className="apply-reset-buttons">
          <button onClick={resetFilters}>Reset</button>
          <button onClick={applyFilters}>Apply</button>
        </div>
        </div>
      </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!showDashboard && !dashboardVisible && (
            <img
              src="https://cdn.iconscout.com/icon/free/png-256/free-collapse-right-1485695-1258916.png?f=webp"
              alt="Reopen"
              className="reopen-button"
              onClick={toggleDashboard}
              style={{ width: "25px", height: "25px", marginLeft: "-30px", marginTop: "0px" }}
            />
      )}
      {showAbout && (
        <div className="blurb">
          <div className="blurb-content">
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
        <div className="blurb">
          <div className="blurb-content">
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
    </div>
  );
}
