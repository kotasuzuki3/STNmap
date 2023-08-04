import React, { useState } from "react";
import Map from "./Map";
import PointMap from "./PointMap";
import "./styles.css";

export default function App() {
  const [mapType, setMapType] = useState("heatmap");

  const handleFlipMap = () => {
    setMapType((prevMapType) => (prevMapType === "heatmap" ? "point" : "heatmap"));
  };

  return (
    <div className="App">
      <button onClick={handleFlipMap} className="toggle-button">
        {mapType === "heatmap" ? "View Point Map" : "View Heat Map"}
      </button>
      {mapType === "heatmap" ? <Map /> : <PointMap />}
    </div>
  );
}

