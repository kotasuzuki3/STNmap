import React, { useEffect, useRef, useState } from "react";
import { debounce } from 'lodash';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./index.css";

export default function PointMap() {
  const mapRef = useRef(null);
  const alaskaMapRef = useRef(null);
  const hawaiiMapRef = useRef(null);
  const [autoplay, setAutoplay] = useState(false);
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
  const autoplayIntervalRef = useRef(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [selectedYear, setSelectedYear] = useState("All");
  const [showDashboardContent, setShowDashboardContent] = useState(true);
  const [dashboardVisible, setDashboardVisible] = useState(true);

  const filterValidData = (data) => {
    const validData = data
      .filter((point) => point.latitude !== null && point.longitude !== null)
      .map((point) => ({
        ...point,
        incident_date: new Date(point.incident_date).toISOString().split("T")[0],
      }));

    return validData;
  };

  const validData = filterValidData(pointData);
  
  const [selectedTime, setSelectedTime] = useState(new Date(Math.max(...validData.map((point) => new Date(point.incident_date)))));
  const stateCoordinates = {
    AL: { lat: 32.806671, lon: -86.791130 },
    AK: { lat: 61.370716, lon: -152.404419 },
    AZ: { lat: 33.729759, lon: -111.431221 },
    AR: { lat: 34.969704, lon: -92.373123 },
    CA: { lat: 36.116203, lon: -119.681564 },
    CO: { lat: 39.059811, lon: -105.311104 },
    CT: { lat: 41.597782, lon: -72.755371 },
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

  const handleSelectedTimeChange = (value) => {
    setPendingFilters((prevFilters) => ({ ...prevFilters, selectedTime: value }));
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

  const handleTimeSliderChange = debounce(() => {
    const timeSlider = timeSliderRef.current;
    const value = parseInt(timeSlider.value);

    const minDate = new Date("2010-01-01");
    const maxDate = new Date(Math.max(...validData.map((point) => new Date(point.incident_date))));

    const selectedTimestamp = +minDate + (+maxDate - +minDate) * (value / 100);
    const selectedDate = new Date(selectedTimestamp);

    const formattedDate = `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;

    timeLabelRef.current.textContent = formattedDate;

    if (selectedYear === "All" || validData.some((point) => new Date(point.incident_date).getFullYear() === parseInt(selectedYear))) {
      setSelectedTime(selectedTimestamp);
      updateMapWithSelectedTime(selectedTimestamp);
    }
  }, 150);
  

  

  const updateMapWithSelectedTime = (selectedTimestamp) => {
    const filteredData = validData.filter((point) => {
      const incidentTimestamp = new Date(point.incident_date).getTime();
      return incidentTimestamp <= selectedTimestamp;
    });
  
    updateMapWithFilteredData(filteredData);
  };

  const handleResetZoom = () => {
    
      map.setView([40.0902, -100.7129], 5);
  
    // Reset Alaska map's view
    if (alaskaMapRef.current) {
      alaskaMapRef.current.setView([64.2008, -149.4937], 2);
    }
  
    // Reset Hawaii map's view
    if (hawaiiMapRef.current) {
      hawaiiMapRef.current.setView([21.3114, -157.7964], 5);
    }
};

  const calculateFormattedDate = (sliderValue) => {
    const minDate = new Date("2010-01-01");
    const maxDate = new Date(Math.max(...pointData.map((point) => new Date(point.incident_date))));
    const step = (maxDate - minDate) / 100;
  
    const selectedTimestamp = +minDate + step * sliderValue;
    const selectedDate = new Date(selectedTimestamp);
    return `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
  };

  const handleAutoplay = () => {
    setAutoplay(!autoplay);
  
    if (autoplay) {
      clearInterval(autoplayIntervalRef.current);
    } else {
      
      autoplayIntervalRef.current = setInterval(() => {
        const timeSlider = timeSliderRef.current;
        const currentValue = parseInt(timeSlider.value);
        const newValue = (currentValue + 1) % 101; 
        timeSlider.value = newValue;
        timeLabelRef.current.textContent = calculateFormattedDate(newValue);
        handleTimeSliderChange();
      }, 350);
    }
  };

  const updateMapWithFilteredData = (validData) => {
    if (map) {
      if (!pointLayerRef.current) {
        pointLayerRef.current = L.featureGroup().addTo(map);
      } else {
        pointLayerRef.current.clearLayers();
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
      .filter(
        (point) =>
          new Date(point.incident_date).getTime() <= selectedTime
      )
      .filter(
        (point) =>
          (pendingFilters.selectedYear === "All" ||
            new Date(point.incident_date).getFullYear() === parseInt(pendingFilters.selectedYear))
      );
  
    filteredData.forEach((point) => {
      // Create and add markers to the pointLayer for filtered data
      const customIcon = L.icon({
        iconUrl:
          "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png",
        iconSize: [20, 20],
      });
  
      const marker = L.marker(
        [point.latitude, point.longitude],
        { icon: customIcon }
      ).addTo(pointLayerRef.current);
  
      let popUpContent = `<div class="popup-content">`;
  
      if (point.url) {
        popUpContent += `
          <img src="${point.url}" alt="${point.first_name} ${point.last_name}" style="width: 100px; height: 110px;"><br>`;
      }
  
      popUpContent += `
        <strong>${point.first_name} ${point.last_name}</strong><br>
        Location: ${point.city}, ${point.state}<br>
        Incident Date: ${point.incident_date}<br>
        Gender: ${point.gender}<br>
        Age: ${point.age}<br>
        <div class="popup-bio">
          Description: ${point.bio_info}
        </div>
      </div>`;
  
      marker.bindPopup(popUpContent);
  
      if (point.state === "AK") {
        const alaskaMarker = L.marker(
          [point.latitude, point.longitude],
          { icon: customIcon }
        ).addTo(alaskaMapRef.current);
      }
  
      if (point.state === "HI") {
        const hawaiiMarker = L.marker(
          [point.latitude, point.longitude],
          { icon: customIcon }
        ).addTo(hawaiiMapRef.current);
      }
    });
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
        setPointData(validData);

          const newMap = L.map(mapRef.current, {
            zoomControl: false,
          }).setView([40.0902, -100.7129], 5);

          const basemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            minZoom: 3,
          });
          basemapLayer.addTo(newMap);

          setMap(newMap);

          // Initialize the Alaska Map
          const alaskaMap = L.map("alaska-map", {
            zoomControl: false,
          }).setView([64.2008, -149.4937], 2);
          alaskaMapRef.current = alaskaMap;

          const alaskaBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            minZoom: 3,
          });
          alaskaBasemapLayer.addTo(alaskaMap);

          // Initialize the Hawaii map
          const hawaiiMap = L.map("hawaii-map", {
            zoomControl: false,
          }).setView([21.3114, -157.7964], 5);
          hawaiiMapRef.current = hawaiiMap;

          const hawaiiBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            minZoom: 3,
          });
          hawaiiBasemapLayer.addTo(hawaiiMap);

        const initialTimelineValue = 100;
        timeSliderRef.current.value = initialTimelineValue;
        timeLabelRef.current.textContent = '11/12/2020';
        pointLayerRef.current = L.featureGroup().addTo(newMap);
  
        
        validData.forEach((point) => {
          // Create and add markers to the pointLayer for filtered data
          const customIcon = L.icon({
            iconUrl:
              "https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png",
            iconSize: [20, 20],
          });
    
          const marker = L.marker(
            [point.latitude, point.longitude],
            { icon: customIcon }
          ).addTo(pointLayerRef.current);
          
          let popUpContent = `<div class="popup-content">`;
      
      if (point.url) {
        popUpContent += `
          <img src="${point.url}" alt="${point.first_name} ${point.last_name}" style="width: 100px; height: 110px;"><br>`;
      }
    
      popUpContent += `
        <strong>${point.first_name} ${point.last_name}</strong><br>
        Location: ${point.city}, ${point.state}<br>
        Incident Date: ${point.incident_date}<br>
        Gender: ${point.gender}<br>
        Age: ${point.age}<br>
        <div class="popup-bio">
          Description: ${point.bio_info}
        </div>
      </div>`;
    
      marker.bindPopup(popUpContent);
    
    
      if (point.state === "AK") {
        const alaskaMarker = L.marker(
          [point.latitude, point.longitude],
          { icon: customIcon }
        ).addTo(alaskaMapRef.current);
      }
    
      if (point.state === "HI") {
        const hawaiiMarker = L.marker(
          [point.latitude, point.longitude],
          { icon: customIcon }
        ).addTo(hawaiiMapRef.current);
      }
        });

      } catch (error) {
        console.error("Error initializing main map:", error);
      }
    };

    initializeMap()
  }, []);

  useEffect(() => {
    const timeSlider = timeSliderRef.current;
    timeSlider.addEventListener('input', handleTimeSliderChange);

    if (selectedState !== "All") {
      const state = stateCoordinates[selectedState];
      if (state) {
        map.setView([stateCoordinates[selectedState].lat, stateCoordinates[selectedState].lon], 6);
      }
    }

    if (map) { 
      if (selectedState === "All") {
        map.setView([40.0902, -100.7129], 5);
      }
    }

    updateMapWithFilteredData(validData);

  }, [selectedState, selectedGender, selectedAgeRange, selectedTime, selectedYear]);


  return (
    <div className="map-container">
      <div className="menu">
        <img
          src="https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg"
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
                    onInput={handleTimeSliderChange}
                  />
                  <div className="time-label" ref={timeLabelRef}></div>
                  {/* <img
                    src={autoplay ? "https://www.pngall.com/wp-content/uploads/5/Pause-Button-Transparent.png" : "https://cdn-icons-png.flaticon.com/512/2/2287.png"}
                    alt="Play/Pause"
                    className={`autoplay-icon ${autoplay ? "active" : ""}`}
                    onClick={handleAutoplay}
                    style={{ width: "25px", height: "25px" }}
                  /> */}
                </div>
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
    {Array.from(new Set(validData.map((point) => new Date(point.incident_date).getFullYear())))
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
  <label htmlFor="ageRangeFilter">Select Age Range:</label>
  <div className="range-slider">
    <input
      type="range"
      min={0}
      max={100}
      value={pendingFilters.selectedAgeRange[0]}
      onChange={(e) =>
        handleSelectedAgeRangeChange([parseInt(e.target.value), selectedAgeRange[1]])
      }
    />
    <input
      type="range"
      min={0}
      max={100}
      value={pendingFilters.selectedAgeRange[1]}
      onChange={(e) =>
        handleSelectedAgeRangeChange([selectedAgeRange[0], parseInt(e.target.value)])
      }
    />
  </div>
  <div>
    {pendingFilters.selectedAgeRange[0]} - {pendingFilters.selectedAgeRange[1]} years
  </div>
  <br></br>
  <div className="dashboard-section-content">
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
