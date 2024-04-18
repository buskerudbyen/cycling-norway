import React from "react";
import { Popup } from "react-map-gl";
import { PopupProps } from "./types";

const BikelyPopup = (props: PopupProps) => (
  <Popup
    latitude={props.lngLat[1]}
    longitude={props.lngLat[0]}
    onClose={props.onClose}
  >
    <h3>
      {props.point.name} ({props.point.id})
    </h3>
    <div>{props.point.note}</div>
  </Popup>
);

export default BikelyPopup;
