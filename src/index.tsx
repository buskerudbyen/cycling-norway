import React from "react";
import ReactDOM from "react-dom/client";
import MapContainer from "./components/Map";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <MapContainer />
  </React.StrictMode>,
);
