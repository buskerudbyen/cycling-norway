import React from "react";
import { Popup } from "react-map-gl";
import { Typography } from "@mui/material";
import { PopupProps } from "./types";

const ClosedRoadPopup = (props: PopupProps) => (
  <Popup
    latitude={props.lngLat[1]}
    longitude={props.lngLat[0]}
    onClose={props.onClose}
  >
    <Typography>
      Usikkert vinterføre. Anlegg er merket med at det ikke måkes om vinteren.
    </Typography>
  </Popup>
);

export default ClosedRoadPopup;
