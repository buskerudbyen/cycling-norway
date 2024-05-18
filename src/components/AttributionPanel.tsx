import { Box, Button, Modal, Typography } from "@mui/material";
import React, { useState } from "react";
import type { MapRef } from "react-map-gl/maplibre";

type Props = {
  dest?: number[];
  isWidget?: boolean;
  mapRef: {
    current: MapRef | null;
  };
};

const AttributionPanel = (props: Props) => {
  const [isPolicyPopup, setPolicyPopup] = useState(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    border: "1px solid #000",
    boxShadow: 24,
    p: 2,
  };

  const togglePolicyPopup = () => {
    setPolicyPopup(!isPolicyPopup);
  };

  return (
    <div className="maplibregl-ctrl maplibregl-ctrl-attrib">
      {props.isWidget && (
        <Button
          variant="text"
          size="small"
          sx={{ fontWeight: "normal" }}
          onClick={() => {
            const thisUrl = new URL(window.location.href);
            const searchParams = new URLSearchParams(
              thisUrl.searchParams,
            ).toString();
            const to = props.dest
              ? `&to=${props.dest[0]}%2C${props.dest[1]}`
              : "";
            const newUrl = `https://sykkelveier.no/?${searchParams}${to}#${props.mapRef?.current?.getZoom()}/${
              props.mapRef?.current?.getCenter().lat
            }/${props.mapRef?.current?.getCenter().lng}`;
            window.open(newUrl, "_blank")?.focus();
          }}
        >
          Vis full side
        </Button>
      )}
      <Button
        variant="text"
        size="small"
        onClick={togglePolicyPopup}
        sx={{ fontWeight: "normal" }}
      >
        Personvern
      </Button>
      <div className="attribution-link-box">
        <a
          href="https://www.maptiler.com/copyright/"
          target="_blank"
          rel="noreferrer"
        >
          &copy;&thinsp;MapTiler
        </a>
      </div>
      <div className="attribution-link-box">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          &copy;&thinsp;OpenStreetMaps bidragsytere
        </a>
      </div>

      {/* biome-ignore format: We like it better this way */}
      <Modal id={"privacy-policy"} open={isPolicyPopup} onClose={togglePolicyPopup} aria-labelledby="modal-title">
				<Box sx={style} className="modal-box">
					<Typography id="modal-title" variant="h5" component="h1">
						Personopplysninger og personvern
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Buskerudbyen og Drammen kommune er ansvarlig for tjenesten som leveres her på Sykkelveier.no (og <a href="https://sykkelveier.no/">sykkelveier.no</a>). Se websiden <a href="https://www.drammen.kommune.no/">drammen.kommune.no</a> for mer informasjon om personvern og personvernombud. Du kan også ta kontakt med oss på post @ buskerudbyen.no.
					</Typography>
					<Typography variant="h6" component="h2" sx={{ mt: 2 }}>
						Hvilken informasjon lagres?
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Sykkelveier.no lagrer ingen personinformasjon om brukeren. For logger, lagres IP-adresser som besøker siden.
					</Typography>
					<Typography variant="h6" component="h2" sx={{ mt: 2 }}>
						Videresending av informasjon
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Alle søk på adresser eller steder i Norge blir sendt videre til Entur sitt Nasjonalt reisesøk-API. Behandling av disse dataene er dekket av <a href="https://om.entur.no/personvern/">Enturs personvernregler</a>.
					</Typography>
					<Typography variant="h6" component="h2" sx={{ mt: 2 }}>
						Hvordan sikrer vi dine personopplysninger?
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Sykkelveier følger kravene til informasjonssikkerhet i gjeldende personvernlovgivning.
						Vi har etablert rutiner og tiltak for å sikre at uvedkommende ikke får tilgang til løsningen. Tiltakene inkluderer blant annet jevnlige risikovurderinger, tilpassede og oppdaterte tekniske systemer og fysiske prosedyrer for å ivareta informasjonssikkerheten.
					</Typography>
					<Typography variant="h6" component="h2" sx={{ mt: 2 }}>
						Din posisjon
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Søket med «Finn min posisjon» skjer kun i nettleseren, så posisjonen blir ikke sendt til serveren før man søker på en rute med GPS-posisjon aktiv. Posisjonen finner man ved hjelp av telefonens GPS-funksjon, WiFi-tilkoblinger, IP-adresser, RFID, Bluetooth, MAC-adresser og GSM/CDMA-celle-ID. Om nettleseren vil vite hvor man er, spør den om lov først. Du kan alltid regulere denne tilgangen i nettleserens innstillinger.
					</Typography>
					<Typography className="modal-description" sx={{ mt: 2 }} align="justify" >
						Personvernerklæringen ble senest oppdatert 3. mai 2023.
					</Typography>
				</Box>
			</Modal>
    </div>
  );
};

export default AttributionPanel;
