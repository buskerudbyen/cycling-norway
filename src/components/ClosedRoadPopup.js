import React from "react";
import { Popup } from "react-map-gl";
import { Typography } from "@mui/material";

const ClosedRoadPopup = (props) => (
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
