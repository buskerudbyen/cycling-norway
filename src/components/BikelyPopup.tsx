import React from "react";
import { Popup } from "react-map-gl";
import { PopupProps } from "./types";

const BikelyPopup = (props: PopupProps) => (
  <Popup
    latitude={props.lngLat.lat}
    longitude={props.lngLat.lng}
    onClose={props.onClose}
  >
    <h3>
      {props.point.name} ({props.point.id})
    </h3>
    <div>{props.point.note}</div>
  </Popup>
);

export default BikelyPopup;
