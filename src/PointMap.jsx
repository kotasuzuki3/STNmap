import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./index.css";

export default function PointMap() {
  const mapRef = useRef(null);
  const alaskaMapRef = useRef(null);
  const hawaiiMapRef = useRef(null);
  const pointLayerRef = useRef(null);
  const [pointData, setPointData] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const [activeButton, setActiveButton] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  const cities = [...new Set(pointData.map((point) => point.city))];
  const states = [...new Set(pointData.map((point) => point.state))];

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

  const filterValidData = (data) => {
    const validData = data
      .filter((point) => point.latitude !== null && point.longitude !== null)
      .map((point) => ({
        ...point,
        incident_date: new Date(point.incident_date).toISOString().split("T")[0],
      }));

    return validData;
  };

  useEffect(() => {
    let map;
    let alaskaMap;
    let hawaiiMap;
    const initializeMap = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/data");
        const jsonData = await response.json();
        const validData = filterValidData(jsonData);
        setPointData(validData);

        // Initialize the map outside of the useEffect
        map = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([37.0902, -95.7129], 4.4);

        const basemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          minZoom: 3,
        });
        basemapLayer.addTo(map);

        alaskaMap = L.map(alaskaMapRef.current, {
          zoomControl: false,
        }).setView([64.2008, -149.4937], 2);

        const alaskaBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        alaskaBasemapLayer.addTo(alaskaMap);

        hawaiiMap = L.map(hawaiiMapRef.current, {
          zoomControl: false,
        }).setView([21.3114, -157.7964], 5);

        const hawaiiBasemapLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          minZoom: 3,
        });
        hawaiiBasemapLayer.addTo(hawaiiMap);

        // Initialize the pointLayer feature group outside of the useEffect
        const pointLayer = L.featureGroup().addTo(map);
        pointLayerRef.current = pointLayer;

        // Fetch and filter your data here
        const filteredData = filterDataByState(validData);

        // Clear existing markers from the pointLayer
        pointLayer.clearLayers();

        // Add filtered markers to the pointLayer
        filteredData.forEach((point) => {
          const customIcon = L.icon({
            iconUrl: 'https://www.pngall.com/wp-content/uploads/2017/05/Map-Marker-Free-Download-PNG.png',
            iconSize: [20, 20],
          });

          const marker = L.marker([point.latitude, point.longitude], { icon: customIcon }).addTo(pointLayer);

          marker.bindPopup(`<strong>${point.name}</strong><br>Location: ${point.city}, ${point.state}<br>${point.description}`);
        });

        if (pointLayer.getLayers().length > 0) {
          const pointBounds = pointLayer.getBounds();
          if (pointBounds.isValid()) {
            map.fitBounds(pointBounds);
          }
          alaskaMap.fitBounds(pointBounds);
          hawaiiMap.fitBounds(pointBounds);
        }
      } catch (error) {
        console.error("Error initializing point map:", error);
      }
    };

    initializeMap();
  }, [selectedState]);

  const filterDataByState = (validData) => {
    if (selectedState === "All") {
      return validData;
    } else {
      return validData.filter((point) => point.state === selectedState);
    }
  };

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
      <div className="map-container">
        <div ref={mapRef} className="map"></div>
        <div ref={alaskaMapRef} id="alaska-map" className="alaska-map"></div>
        <div ref={hawaiiMapRef} id="hawaii-map" className="hawaii-map"></div>
        <div className="dashboard">
          <h2>Dashboard</h2>
          <div className="filter">
            <label htmlFor="stateFilter">Select State:</label>
            <select
              id="stateFilter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="All">All</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
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
    </div>
  );
}
