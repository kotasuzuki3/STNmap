import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./index.css";
import ReactSlider from "react-slider";
import logo from "./assets/logo.png";

export default function PointMap() {
  const mapRef = useRef(null);
  const alaskaMapRef = useRef(null);
  const hawaiiMapRef = useRef(null);
  const alaskaLayerRef = useRef(null);
  const hawaiiLayerRef = useRef(null);
  const pointLayerRef = useRef(null);
  const [pointData, setPointData] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [activeButton, setActiveButton] = useState("");
  const [map, setMap] = useState(null);
  const [selectedState, setSelectedState] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedAgeRange, setSelectedAgeRange] = useState([0, 100]);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedYear, setSelectedYear] = useState("All");
  const [showDashboardContent, setShowDashboardContent] = useState(true);
  const [dashboardVisible, setDashboardVisible] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const isMobile = window.matchMedia(
    "(max-device-width: 768px), (max-width: 768px) and (orientation: portrait), (max-height: 500px)"
  ).matches;
  const initialZoom = isMobile ? 3 : 5;

  const filterValidData = (data) => {
    const validData = data
      .filter((point) => point.latitude && point.longitude)
      .map((point) => ({
        ...point,
        incident_date: new Date(point.incident_date).toISOString().split("T")[0],
      }));

    return validData;
  };
  const validData = filterValidData(pointData);  

  const stateCoordinates = {
    AL: { lat: 32.806671, lon: -86.79113 },
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
    KS: { lat: 38.5266, lon: -96.726486 },
    KY: { lat: 37.66814, lon: -84.670067 },
    LA: { lat: 31.169546, lon: -91.867805 },
    ME: { lat: 44.693947, lon: -69.381927 },
    MD: { lat: 39.063946, lon: -76.802101 },
    MA: { lat: 42.230171, lon: -71.530106 },
    MI: { lat: 43.326618, lon: -84.536095 },
    MN: { lat: 45.694454, lon: -93.900192 },
    MS: { lat: 32.741646, lon: -89.678696 },
    MO: { lat: 38.456085, lon: -92.288368 },
    MT: { lat: 46.921925, lon: -110.454353 },
    NE: { lat: 41.12537, lon: -98.268082 },
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
    RI: { lat: 41.680893, lon: -71.51178 },
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
    WY: { lat: 42.755966, lon: -107.30249 },
  };

  const states = [...new Set(pointData.map((point) => point.state))].sort();
  const [pendingFilters, setPendingFilters] = useState({
    selectedState,
    selectedGender,
    selectedAgeRange: selectedAgeRange.slice(),
    selectedYear,
    selectedTime,
  });

  const handleApplyFilters = () => {
    setSelectedState(pendingFilters.selectedState);
    setSelectedGender(pendingFilters.selectedGender);
    setSelectedAgeRange(pendingFilters.selectedAgeRange);
    setSelectedYear(pendingFilters.selectedYear);
    setSelectedTime(pendingFilters.selectedTime);

    updateMapWithFilteredData(validData);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      selectedState: "All",
      selectedGender: "All",
      selectedAgeRange: [0, 100],
      selectedYear: "All",
      selectedTime: new Date(Math.max(...validData.map((point) => new Date(point.incident_date)))),
    };
    
    map.setView([40.0902, -100.7129], initialZoom);

    setPendingFilters(defaultFilters);
    setSelectedState(defaultFilters.selectedState);
    setSelectedGender(defaultFilters.selectedGender);
    setSelectedAgeRange(defaultFilters.selectedAgeRange);
    setSelectedYear(defaultFilters.selectedYear);
    setSelectedTime(defaultFilters.selectedTime);

    updateMapWithFilteredData(validData);
  };

  const handleSelectedStateChange = (value) => {
    setPendingFilters((prevFilters) => ({ ...prevFilters, selectedState: value }));
  };

  const handleSelectedGenderChange = (value) => {
    setPendingFilters((prevFilters) => ({ ...prevFilters, selectedGender: value }));
  };

  const handleSelectedAgeRangeChange = (value) => {
    setPendingFilters((prevFilters) => ({
      ...prevFilters,
      selectedAgeRange: [
        value[0] !== undefined ? value[0] : prevFilters.selectedAgeRange[0],
        value[1] !== undefined ? value[1] : prevFilters.selectedAgeRange[1],
      ],
    }));
  };

  const handleSelectedYearChange = (value) => {
    setPendingFilters((prevFilters) => ({ ...prevFilters, selectedYear: value }));
  };

  const toggleDashboard = () => {
    if (showDashboard) {
      setDashboardVisible(false);
    } else {
      setDashboardVisible(true);
    }
    setShowDashboard(!showDashboard);
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

  const toggleSubmit = () => {
    window.open("https://form.jotform.com/222938481763163", "_blank");
  };

  const contactUs = () => {
    window.location.href = "mailto:stn@nonopera.org";
  };

  const handleFeedback = () => {
    window.open("https://form.jotform.com/231036759147055", "_blank");
  };

  const handleResetZoom = () => {
    map.setView([40.0902, -100.7129], initialZoom);

    // Reset Alaska map's view
    if (alaskaMapRef.current) {
      alaskaMapRef.current.setView([64.2008, -149.4937], isMobile ? 0 : 2);
    }

    // Reset Hawaii map's view
    if (hawaiiMapRef.current) {
      hawaiiMapRef.current.setView([21.3114, -157.7964], isMobile ? 4 : 5);
    }
  };

  const updateMapWithFilteredData = (validData) => {
    try {
      if (map) {
        if (!pointLayerRef.current) {
          pointLayerRef.current = L.featureGroup().addTo(map);
        } else {
          pointLayerRef.current.clearLayers();
        }
      }
  
      if (alaskaMapRef.current) {
        if (!alaskaLayerRef.current) {
          alaskaLayerRef.current = L.featureGroup().addTo(alaskaMapRef.current);
        } else {
          alaskaLayerRef.current.clearLayers();
        }
      }
  
      if (hawaiiMapRef.current) {
        if (!hawaiiLayerRef.current) {
          hawaiiLayerRef.current = L.featureGroup().addTo(hawaiiMapRef.current);
        } else {
          hawaiiLayerRef.current.clearLayers();
        }
      }
  
      const filteredData = validData
        .filter(
          (point) =>
            (pendingFilters.selectedState === "All" || point.state === pendingFilters.selectedState) &&
            (pendingFilters.selectedGender === "All" || point.gender === pendingFilters.selectedGender)
        )
        .filter((point) => {
          const age = point.age;
          return age >= pendingFilters.selectedAgeRange[0] && age <= pendingFilters.selectedAgeRange[1];
        })
        .filter((point) => new Date(point.incident_date).getTime() <= selectedTime)
        .filter(
          (point) =>
            pendingFilters.selectedYear === "All" ||
            new Date(point.incident_date + "T00:00:00Z").getUTCFullYear() === parseInt(selectedYear)
        );
  
      filteredData.forEach((point) => {
        const customIcon = L.icon({
          iconUrl: "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png",
          iconSize: [20, 20],
        });
  
        const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(pointLayerRef.current);
  
        let popUpContent = `<div class="popup-content">`;
  
        if (point.url) {
          popUpContent += `<img src="${point.url}" alt="${point.first_name} ${point.last_name}" style="width: 100px; height: 110px;"><br>`;
        }
  
        popUpContent += `<strong>${point.first_name} ${point.last_name}</strong><br>Location: ${point.city}, ${point.state}<br>Incident Date: ${point.incident_date}<br>Gender: ${point.gender}<br>Age: ${point.age}<br><div class="popup-bio">Description: ${point.bio_info}</div></div>`;
  
        marker.bindPopup(popUpContent);
  
        if (point.state === "AK") {
          L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(alaskaLayerRef.current);
        }
  
        if (point.state === "HI") {
          L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(hawaiiLayerRef.current);
        }
      });
    } catch (error) {
      console.error("Error updating map with filtered data:", error);
    }
  };
  
  
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const jsonData = await response.json();


        const validData = jsonData
          .filter((point) => point.latitude !== null && point.longitude !== null)
          .map((point) => ({
            ...point,
            incident_date: new Date(point.incident_date).toISOString().split("T")[0],
          }));

          console.log("✅ filtered validData:", validData);

        setPointData(validData);


        const defaultFilters = {
          selectedState: "All",
          selectedGender: "All",
          selectedAgeRange: [0, 100],
          selectedYear: "All",
          selectedTime: new Date(Math.max(...validData.map((point) => new Date(point.incident_date)))),
        };

        setPendingFilters(defaultFilters);
        setSelectedState(defaultFilters.selectedState);
        setSelectedGender(defaultFilters.selectedGender);
        setSelectedAgeRange(defaultFilters.selectedAgeRange);
        setSelectedYear(defaultFilters.selectedYear);
        setSelectedTime(defaultFilters.selectedTime);

        updateMapWithFilteredData(validData);

        setSelectedTime(new Date(Math.max(...validData.map((point) => new Date(point.incident_date)))));
    
        const map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([40.0902, -100.7129], initialZoom);
    
        const basemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
          minZoom: 3,
        });
        basemapLayer.addTo(map);
    
        setMap(map);
    
        const alaskaMap = L.map("alaska-map", {
          zoomControl: false,
          attributionControl: false
        }).setView([64.2008, -149.4937], isMobile ? 0 : 2);
        alaskaMapRef.current = alaskaMap;

        setTimeout(() => {
          alaskaMap.invalidateSize();
        }, 0);
    
        const alaskaBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        alaskaBasemapLayer.addTo(alaskaMap);
    
        const hawaiiMap = L.map("hawaii-map", {
          zoomControl: false,
          attributionControl: false
        }).setView([21.3114, -157.7964], isMobile ? 4 : 5);
        hawaiiMapRef.current = hawaiiMap;

        setTimeout(() => {
          hawaiiMap.invalidateSize();
        }, 0);
    
        const hawaiiBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        hawaiiBasemapLayer.addTo(hawaiiMap);
    
        pointLayerRef.current = L.featureGroup().addTo(map);
        alaskaLayerRef.current = L.featureGroup().addTo(alaskaMap);
        hawaiiLayerRef.current = L.featureGroup().addTo(hawaiiMap);
    
        validData.forEach((point) => {
          const customIcon = L.icon({
            iconUrl: "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png",
            iconSize: [20, 20],
          });
    
          const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(pointLayerRef.current);
    
          let popUpContent = `<div class="popup-content">`;
    
          if (point.url) {
            popUpContent += `<img src="${point.url}" alt="${point.first_name} ${point.last_name}" style="width: 100px; height: 110px;"><br>`;
          }
    
          popUpContent += `<strong>${point.first_name} ${point.last_name}</strong><br>Location: ${point.city}, ${point.state}<br>Incident Date: ${point.incident_date}<br>Gender: ${point.gender}<br>Age: ${point.age}<br><div class="popup-bio">Description: ${point.bio_info}</div></div>`;
    
          marker.bindPopup(popUpContent);
    
          if (point.state === "AK") {
            L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(alaskaLayerRef.current);
          }
    
          if (point.state === "HI") {
            L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(hawaiiLayerRef.current);
          }
        });
      } catch (error) {
        console.error("Error initializing main map:", error);
      }
    };    
    initializeMap();
  }, []);

  useEffect(() => {
    const timeSlider = timeSliderRef.current;
    // timeSlider.addEventListener('input', handleTimeSliderChange);

    if (selectedState !== "All") {
      const state = stateCoordinates[selectedState];
      if (state) {
        map.setView([stateCoordinates[selectedState].lat, stateCoordinates[selectedState].lon], 6);
      }
    }

    if (map) {
      if (selectedState === "All") {
        map.setView([40.0902, -100.7129], initialZoom);
      }
    }

    updateMapWithFilteredData(validData);
  }, [selectedState, selectedGender, selectedAgeRange, selectedTime, selectedYear]);

  return (
    <div className="map-container">
      <div className="menu">
        <div className="menu-header">
        <img
          src={logo}
          alt="Logo"
          className="logo-image"
        />
          <div className="logo-text">SAY THEIR NAMES</div>
        </div>
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
                <br></br>
                <div className="filters">
                <div className="filter">
  <label htmlFor="yearFilter">Select Year: </label>
  <select
    id="yearFilter"
    value={pendingFilters.selectedYear}
    onChange={(e) => handleSelectedYearChange(e.target.value)}
  >
    <option value="All">All</option>
    {Array.from(new Set(validData.map(p => new Date(p.incident_date + "T00:00:00Z").getUTCFullYear())))
      .sort()
      .map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
  </select>
</div>

        <div className="filter">
          <label htmlFor="stateFilter">Select State:  </label>
            <select
              id="stateFilter"
              value={pendingFilters.selectedState}
              onChange={(e) =>handleSelectedStateChange(e.target.value)}
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
    value={pendingFilters.selectedGender}
    onChange={(e) => handleSelectedGenderChange(e.target.value)}
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
            value={pendingFilters.selectedAgeRange}
            min={0}
            max={100}
            onChange={(value) => handleSelectedAgeRangeChange(value)}
            pearling
            minDistance={1}
          />
        <div>
          {pendingFilters.selectedAgeRange[0]} - {pendingFilters.selectedAgeRange[1]} years
        </div>
</div>
  <br></br>
  <div className="apply-reset-buttons">
                <button onClick={handleResetFilters}>Reset</button>
                <button onClick={handleApplyFilters}>Apply</button>
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
