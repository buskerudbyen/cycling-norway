import React, { useState } from "react";
import { Box, Button, Modal, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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

const ButtonHelp = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        id="show-help"
        variant="outlined"
        size="small"
        onClick={() => setIsHelpOpen(!isHelpOpen)}
        sx={{
          backgroundColor: "white",
          minWidth: "unset",
          boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
          border: "0",
          ":hover": { backgroundColor: "white", border: "0" },
        }}
      >
        <HelpOutlineIcon htmlColor="gray" />
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
            <a href="https://developer.entur.org/">Entur</a>, og med midler fra{" "}
            <a href="https://www.buskerudbyen.no/">Buskerudbyen</a>,{" "}
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
            og alle åpne kartdata fra Statens vegvesen og Kartverket. Løsningen
            utviklet av <a href="https://leonard.io/">Leonard</a> og{" "}
            <a href="https://github.com/Beck-berry">Beck-berry</a>. Sist
            oppdatert mars 2023.
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default ButtonHelp;
