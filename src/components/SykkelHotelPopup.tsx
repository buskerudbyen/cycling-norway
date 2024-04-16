import React from "react";
import { Popup } from "react-map-gl";
import { PopupProps } from "./types";

const SykkelHotelPopup = (props: PopupProps) => (
  <Popup
    latitude={props.lngLat.lat}
    longitude={props.lngLat.lng}
    onClose={props.onClose}
  >
    <h3>{props.point["name:latin"]}</h3>
    <div style={{ textAlign: "justify" }}>
      Parkeringsløsningen i et bygg og bak låste dører er tilgjengelig for alle
      som betaler abonnement, også de som ikke reiser med tog. Bruk appen{" "}
      <a href="https://www.banenor.no/Jernbanen/Sykle-til-stasjonen-/">
        Bane NOR Parkering for registering, abonnement og å åpne porten
      </a>
      . Tilgangen koster 50 kroner og varer i 30 dager. Sykkelhotellene driftes
      av Bane NOR.
    </div>
  </Popup>
);

export default SykkelHotelPopup;
