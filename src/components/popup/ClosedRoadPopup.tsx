import { Typography } from "@mui/material";
import React from "react";
import { Popup } from "react-map-gl";
import type { PopupProps } from "../types";

const ClosedRoadPopup = (props: PopupProps) => (
  <Popup
    latitude={props.lngLat.lat}
    longitude={props.lngLat.lng}
    onClose={props.onClose}
  >
    <Typography>
      Usikkert vinterføre. Anlegg er merket med at det ikke måkes om vinteren.
    </Typography>
  </Popup>
);

export default ClosedRoadPopup;
