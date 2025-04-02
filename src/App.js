import React, { useState } from "react";
import Map from "./Map";
import PointMap from "./PointMap";
import "./styles.css";

export default function App() {
  const [mapType, setMapType] = useState("point");

  const handleFlipMap = () => {
    setMapType((prevMapType) => (prevMapType === "point" ? "heatmap" : "point"));
  };

  let mapComponent;
  if (mapType === "point") {
    mapComponent = <PointMap />;
  } else if (mapType === "heatmap") {
    mapComponent = <Map />;
  }

  return (
    <div className={`App ${mapType}-view`}>
      <button onClick={handleFlipMap} className="toggle-button">
        {mapType === "point" ? "View Heat Map" : "View Point Map"}
      </button>
      {mapComponent}
    </div>
  );
}

