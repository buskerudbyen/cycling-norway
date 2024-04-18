import React from "react";
import { Popup } from "react-map-gl";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import { PopupProps } from "./types";

const SnowPlowPopup = (props: PopupProps) => (
  <Popup
    maxWidth="280px"
    latitude={props.lngLat[1]}
    longitude={props.lngLat[0]}
    onClose={props.onClose}
  >
    <h3>Vinterbrøytning av sykkelveier (test)</h3>
    <table style={{ borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <td>
            <HorizontalRuleIcon
              htmlColor="#00FF00"
              className="snow-plow-color"
            />
          </td>
          <td>0-3 timer siden sist brøyting</td>
        </tr>
        <tr>
          <td>
            <HorizontalRuleIcon
              htmlColor="#f69a20"
              className="snow-plow-color"
            />
          </td>
          <td>3 timer eller senere siden sist brøyting</td>
        </tr>
        <tr>
          <td>
            <HorizontalRuleIcon htmlColor="#fff" className="snow-plow-color" />
          </td>
          <td>
            Det snør. Brøyting pågår. Det prioriteres etter kontrakt med veieier
          </td>
        </tr>
      </tbody>
    </table>
    <div style={{ textAlign: "justify" }}>
      Vinterdriftsinformasjon i sykkelkartet er en test i prosjektet: «Smart
      Drift» i samarbeid mellom Statens vegvesen, Viken fylkeskommune, Drammen
      kommune og Buskerudbyen i 2023. Har du spørsmål, ta kontakt med
      post(krøllalfa)buskerudbyen(punktum)no.
    </div>
  </Popup>
);

export default SnowPlowPopup;
