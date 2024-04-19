import React, { useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Modal } from "@mui/material";
import RouteIcon from "@mui/icons-material/Route";
import TimerIcon from "@mui/icons-material/Timer";
import TerrainIcon from "@mui/icons-material/Terrain";

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
  duration: number | null;
  distance: number | null;
  elevation: number | null;
  elevationProfile: number[] | null;
};

const RoutingResults = (props: Props) => {
  const [showElevationPopup, setShowElevationPopup] = useState(false);

  ChartJS.register(...registerables);

  if (props.duration === null || props.distance === null) return null;

  const duration =
    props.duration !== null
      ? new Date(props.duration * 1000).toISOString().slice(11, 16)
      : "0:00";
  const distance =
    props.distance !== null ? (props.distance / 1000).toFixed(1) : "0";
  const elevation = props.elevation !== null ? props.elevation.toFixed(0) : "0";

  return (
    <div id="routingResults">
      <div>
        <TimerIcon fontSize="small" htmlColor="gray" />
        <span className="routing-results-display-text">{duration}</span>
      </div>
      <div>
        <RouteIcon fontSize="small" htmlColor="gray" />
        <span className="routing-results-display-text">{distance} km</span>
      </div>
      <div
        className="elevation-details-trigger"
        onClick={() => setShowElevationPopup(true)}
      >
        <TerrainIcon fontSize="small" htmlColor="gray" />
        <span className="routing-results-display-text routing-results-clickable-text">
          {elevation} m
        </span>
      </div>
      <Modal
        id={"elevationInfo"}
        aria-labelledby="modal-title"
        open={showElevationPopup}
        onClose={() => setShowElevationPopup(false)}
      >
        <Box sx={style} className="modal-box">
          <Line
            datasetIdKey="id"
            className="elevation-details-modal"
            data={{
              labels: props.elevationProfile ?? [],
              datasets: [
                {
                  data: props.elevationProfile,
                  fill: "origin",
                  borderColor: "#162da0",
                  backgroundColor: "rgba(22,45,160,0.5)",
                },
              ],
            }}
            options={{
              events: [],
              plugins: {
                legend: {
                  display: false,
                },
                subtitle: {
                  display: true,
                  text: "Høydeprofil (meter)",
                },
              },
              scales: {
                x: {
                  display: false,
                },
              },
            }}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default RoutingResults;
