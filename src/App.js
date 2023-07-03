import React from "react";
import "./styles.css";
import Map from "./Map_Time";
import DataFetcher from './DataFetcher';

export default function App() {
  return (
    <div className="App">
      <DataFetcher />
      <Map />
    </div>
  );
}