import React from "react";
import { Popup } from "react-map-gl";
import type { PopupProps } from "../types";

const BikelyPopup = ({popup}: {popup: PopupProps}) => (
  <Popup
    latitude={popup.lngLat[1]}
    longitude={popup.lngLat[0]}
    onClose={popup.onClose}
  >
    <h3>
      {popup.point.name} ({popup.point.id})
    </h3>
    <div>{popup.point.note}</div>
  </Popup>
);

export default BikelyPopup;
