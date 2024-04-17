import React, { useState } from "react";
import { Box, Modal } from "@mui/material";
import { Line } from "react-chartjs-2";
import TimerIcon from "@mui/icons-material/Timer";
import HeightIcon from "@mui/icons-material/Height";
import ExpandIcon from "@mui/icons-material/Expand";

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

  if (props.duration === null || props.distance === null) return null;

  const duration =
    props.duration !== null
      ? new Date(props.duration * 1000).toISOString().slice(11, 19)
      : "0:00:00";
  const distance =
    props.distance !== null ? (props.distance / 1000).toFixed(2) : "0";
  const elevation = props.elevation !== null ? props.elevation.toFixed(2) : "0";

  return (
    <div id="routingResults">
      <TimerIcon htmlColor="gray" fontSize="small" sx={{ marginLeft: "5px" }} />
      <span style={{ margin: "5px" }}>{duration}</span>
      <HeightIcon
        htmlColor="gray"
        sx={{ transform: "rotate(90deg)", marginLeft: "5px" }}
      />
      <span style={{ margin: "5px" }}>{distance} km</span>
      <span
        className="elevation-details-trigger"
        style={{ marginLeft: "5px" }}
        onClick={() => setShowElevationPopup(true)}
      >
        <ExpandIcon htmlColor="white" sx={{ marginRight: "5px" }} />
        {elevation} m
      </span>
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
