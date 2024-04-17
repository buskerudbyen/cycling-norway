import React, { useEffect, useState } from "react";
import { Box, Button, Modal, Typography } from "@mui/material";
import SearchField from "./SearchField";
import RoutingResults from "./RoutingResults";
import { Chart as ChartJS, registerables } from "chart.js";
import { Feature } from "./types";

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

type Props = {
  chooseStart: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
  chooseDest: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
  reset: () => void;
  duration: number | null;
  distance: number | null;
  elevation: number | null;
  elevationProfile: number[] | null;
};

const Menu = (props: Props) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [prevWidth, setPrevWidth] = useState(window.innerWidth);
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 450
  );
  const [renderFormKeys, setRenderFormKeys] = useState(true);

  ChartJS.register(...registerables);

  useEffect(() => {
    const updateBySize = () => {
      if (prevWidth !== window.innerWidth) {
        setPrevWidth(window.innerWidth);
        setSearchFieldsOpen(window.innerWidth >= 450);
      }
    };
    window.addEventListener("resize", updateBySize);
    return () => window.removeEventListener("resize", updateBySize);
  }, [prevWidth]);

  const resetRoute = () => {
    props.reset();
    setRenderFormKeys(!renderFormKeys);
  };

  return (
    <>
      <div className="menu">
        <Button
          id="searchFieldsButton"
          variant="contained"
          size="small"
          onClick={() => setSearchFieldsOpen(!searchFieldsOpen)}
        >
          Tekstsøk
        </Button>
        <Button
          id="reset"
          variant="contained"
          size="small"
          onClick={resetRoute}
        >
          Nullstill rute
        </Button>
        <Button
          id="show-help"
          variant="contained"
          size="small"
          onClick={() => setIsHelpOpen(!isHelpOpen)}
        >
          Hjelp
        </Button>

        <Modal
          id="help"
          open={isHelpOpen}
          aria-labelledby="modal-title"
          onClose={() => setIsHelpOpen(!isHelpOpen)}
        >
          <Box sx={style} className="modal-box">
            <Typography id="modal-title" variant="h6" component="h2">
              Sykkelkart- og sykkelvei-pilot 2021-2023
            </Typography>
            <Typography
              className="modal-description"
              sx={{ mt: 2 }}
              align="justify"
            >
              Få en anbefalt god sykkelrute fra hvilken som helst vei eller
              skogssti i Norge til et sted du ønsker å reise til. Klikk først på
              hvor du vil reise fra, og klikk igjen for å velge destinasjon.
              Start- og stoppmarkørene kan også da flyttes til nye steder.
              Ruteforslaget vil da oppdateres.{" "}
              <a href="./?from=59.71982%2C10.25855&to=59.74460%2C10.20589#13.35/59.73268/10.22634">
                Vis eksempel.
              </a>
            </Typography>
            <Typography
              className="modal-description"
              sx={{ mt: 2 }}
              align="justify"
            >
              Kartløsningen viser også sykkelruter, sykkelanlegg, parkering,
              offentlige servicestasjoner og annen relevant informasjon for
              syklister. Ønsker du bidra med data eller har spørsmål, ta kontakt
              med post(krøllalfa)buskerudbyen(punktum)no.
            </Typography>
            <Typography
              className="modal-description"
              sx={{ mt: 2 }}
              align="justify"
            >
              Løsningen er utarbeidet i samarbeid med{" "}
              <a href="https://developer.entur.org/">Entur</a>, og med midler
              fra <a href="https://www.buskerudbyen.no/">Buskerudbyen</a>,{" "}
              <a href="https://bymiljopakken.no/">Bymiljøpakken</a> /{" "}
              <a href="https://www.kolumbus.no/">Kolumbus</a>, &nbsp;
              <a href="https://viken.no/">Viken fylkeskommune</a> og{" "}
              <a href="https://www.vegvesen.no/fag/trafikk/its-portalen/its-i-statens-vegvesen/">
                Statens vegvesen (ITS-programmet)
              </a>
              . Takk også til alle frivillige bidragsytere av{" "}
              <a href="https://wiki.openstreetmap.org/wiki/No:Main_Page">
                OpenStreetMap
              </a>{" "}
              og alle åpne kartdata fra Statens vegvesen og Kartverket.
              Løsningen utviklet av <a href="https://leonard.io/">Leonard</a> og{" "}
              <a href="https://github.com/Beck-berry">Beck-berry</a>. Sist
              oppdatert mars 2023.
            </Typography>
          </Box>
        </Modal>
      </div>
      <div id="routing" hidden={!searchFieldsOpen}>
        <div id="searchFields">
          <SearchField
            onChoose={props.chooseStart}
            labelText="Fra"
            rerender={renderFormKeys}
          />
          <SearchField
            onChoose={props.chooseDest}
            labelText="Til"
            rerender={renderFormKeys}
          />
        </div>
        <RoutingResults
          distance={props.distance}
          duration={props.duration}
          elevation={props.elevation}
          elevationProfile={props.elevationProfile}
        />
      </div>
    </>
  );
};

export default Menu;
