import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "./index_dashboard.css";

export default function Map() {
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const timeSliderRef = useRef(null);
  const timeLabelRef = useRef(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true); // State to control the dashboard visibility
  const [heatmapData, setHeatmapData] = useState([]);
  const [dateRange, setDateRange] = useState({ minDate: new Date(), maxDate: new Date() });

  const toggleAbout = () => {
    setShowAbout(!showAbout);
  };

  const toggleMethodology = () => {
    setShowMethodology(!showMethodology);
  };

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  const filterValidData = (data) => {
    const validData = data
      .filter((point) => {
        return point.latitude !== null && point.longitude !== null;
      })
      .map((point) => ({
        ...point,
        incident_date: new Date(point.incident_date).toISOString().split("T")[0],
      }));

    console.log("Valid Data:", validData);

    return validData;
  };

  const updateHeatmap = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/data");
      const jsonData = await response.json();
      const validData = filterValidData(jsonData);
      setHeatmapData(validData);

      // Clear previous heatmap layer
      if (heatLayerRef.current) {
        heatLayerRef.current.remove();
      }

      // Create a new Leaflet Heatmap layer
      const heatLayer = L.heatLayer(
        validData.map((dataPoint) => [
          dataPoint.latitude,
          dataPoint.longitude,
          dataPoint.intensity,
        ]),
        {
          radius: 25,
          blur: 15,
          gradient: {
            0.03: "blue",
            0.06: "cyan",
            0.09: "yellow",
            0.1: "orange",
            0.15: "red",
          },
        }
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
        minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * timelineValue) / 100
      );

      // Update the time label with the selected date
      const formattedDate = currentTime.toLocaleDateString();
      timeLabelRef.current.textContent = formattedDate;

      // Filter the heatmap data based on the current time
      const filteredData = validData.filter((dataPoint) => new Date(dataPoint.incident_date) <= currentTime);

      // Update the heatmap layer with the filtered data
      const heatPoints = filteredData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
        point.intensity,
      ]);

      heatLayerRef.current.setLatLngs(heatPoints);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    let map;
    let heatLayer;

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

        const logoContainer = L.DomUtil.create("div", "logo-container");
        const logoImage = document.createElement("img");
        logoImage.src = "https://www.nonopera.org/WP2/wp-content/uploads/2016/12/NONopNEWlogo-round300-1.jpg";
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
        <div className="dashboard">
          <div className="dashboard-header">
            <div className="dashboard-title"></div>
            <button className="dashboard-collapse" onClick={toggleDashboard}>
              Collapse
            </button>
          </div>
          <div className="dashboard-content">
            <div className="dashboard-section">
                <div className="dashboard-section-title"></div>
                <div className="dashboard-section-content">
                    <img
                        src="https://cdn.icon-icons.com/icons2/1863/PNG/512/zoom-out-map_118446.png"
                        alt="Reset Zoom"
                        className="dashboard-icon"
                        onClick={handleResetZoom}
                        style={{ width: "16px", height: "16px" }}
                    />
                </div>
                </div>
              <div className="dashboard-section-title">
                <img
                  src="https://www.nicepng.com/png/detail/55-558289_information-icon-png-information-icon.png"
                  alt="About"
                  className="dashboard-icon"
                  onClick={toggleAbout}
                  style={{ width: "16px", height: "16px" }}
                />
              </div>
              <div className="dashboard-section-content">
                {showAbout && (
                  <div className="about-dropdown">
                    <p>
                      SAY THEIR NAMES is an ongoing research and mapping project, intended to identify and remember Black Americans
                      killed by police violence since 1919. It is designed with an open-ended timeline to permit several successive
                      years of research, the concurrent development of an interactive map, and the accumulation of community contributions.
                      This map is truly a participatory and interactive project. In the coming months and years as we continue to accumulate
                      research data and develop the online interactive map, we will add the capability to submit data through an online form.
                    </p>
                    <p>
                      For now, please email us if you have additional information on a currently listed Black American, or with additional
                      names that should be included in the map. You may also fill out a form on our website <a href="https://form.jotform.com/222938481763163">HERE</a>.
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
                )}
              </div>
            </div>
            <div className="dashboard-section">
              <div className="dashboard-section-title">
                <img
                  src="https://www.pngkit.com/png/detail/831-8314404_png-file-svg-admin-report-icon.png"
                  alt="Methodology"
                  className="dashboard-icon"
                  onClick={toggleMethodology}
                  style={{ width: "16px", height: "16px" }}
                />
              </div>
              <div className="dashboard-section-content">
                {showMethodology && (
                  <div className="methodology-dropdown">
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
                )}
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
                />
                <div className="time-label" ref={timeLabelRef}></div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
