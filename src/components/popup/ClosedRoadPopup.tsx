import { Typography } from "@mui/material";
import React from "react";
import { Popup } from "react-map-gl";
import type { PopupProps } from "../types";

const ClosedRoadPopup = ({popup}: {popup: PopupProps}) => (
  <Popup
    latitude={popup.lngLat[1]}
    longitude={popup.lngLat[0]}
    onClose={popup.onClose}
  >
    <Typography>
      Usikkert vinterføre. Anlegg er merket med at det ikke måkes om vinteren.
    </Typography>
  </Popup>
);

export default ClosedRoadPopup;
