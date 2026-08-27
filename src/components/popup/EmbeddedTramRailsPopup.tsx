import { Typography } from "@mui/material";
import React from "react";
import { Popup } from "react-map-gl";
import type { PopupProps } from "../types";

const EmbeddedTramRailsPopup = ({popup}: {popup: PopupProps}) => (
  <Popup
    latitude={popup.lngLat[1]}
    longitude={popup.lngLat[0]}
    onClose={popup.onClose}
  >
    <Typography>
      Skinner i veibanen. Vær ekstra forsiktig når du sykler her.
    </Typography>
  </Popup>
);

export default EmbeddedTramRailsPopup;
