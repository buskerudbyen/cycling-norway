import RouteIcon from "@mui/icons-material/Route";
import TimerIcon from "@mui/icons-material/Timer";
import { Box, Modal } from "@mui/material";
import { Chart as ChartJS, registerables } from "chart.js";
import React, { type CSSProperties, type MouseEvent, useState } from "react";
import { Line } from "react-chartjs-2";
import type { Coords } from "../types";

// Note: To make it easy to understand/edit the graphs we keep some styles here
// instead of in stylesheets.

const SPARKLINE_WIDTH = 20 as const;
const SPARKLINE_HEIGHT = 20 as const;

const sparklineContainerStyle: CSSProperties = {
  width: SPARKLINE_WIDTH,
  height: SPARKLINE_HEIGHT,
  position: "relative",
  top: "-2px",
};

const modalGraphStyle = {
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
  start?: Coords | null;
  dest?: Coords | null;
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

  const enturTravelHandler = (e: MouseEvent) => {
    e.preventDefault();
    // The handler is not rendered unless start/dest is set
    const enturUrl = `https://entur.no/reiseresultater?transportModes=rail%2Ctram%2Cbus%2Ccoach%2Cwater%2Ccar_ferry%2Cmetro%2Cflytog%2Cflybuss&date=${Date.now()}&tripMode=oneway&walkSpeed=1.3&minimumTransferTime=120&timepickerMode=departAfter&startLat=${
      props.start!.lat
    }&startLon=${props.start!.lng}&stopLat=${props.dest!.lat}&stopLon=${
      props.dest!.lng
    }`;
    window.open(enturUrl, "_blank")?.focus();
  };

  return (
    <div id="routingResults">
      <div id="infoRow">
        <div>
          <TimerIcon fontSize="small" htmlColor="gray" />
          <span className="routing-results-display-text">{duration}</span>
        </div>
        <div>
          <RouteIcon fontSize="small" htmlColor="gray" />
          <span className="routing-results-display-text">{distance} km</span>
        </div>
        {/* biome-ignore lint: Rebeka will get back to this */}
        <div
          className="elevation-details-trigger"
          onClick={() => setShowElevationPopup(true)}
        >
          <div style={sparklineContainerStyle}>
            <Line
              style={{ width: SPARKLINE_WIDTH, height: SPARKLINE_HEIGHT }}
              width={`${SPARKLINE_WIDTH}px`}
              height={`${SPARKLINE_HEIGHT}px`}
              datasetIdKey="id"
              data={{
                labels: props.elevationProfile ?? [],
                datasets: [
                  {
                    data: props.elevationProfile,
                    fill: "origin",
                    borderColor: "#000000",
                    borderWidth: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    showLine: false,
                    pointRadius: 0,
                  },
                ],
              }}
              options={{
                events: [],
                responsive: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  subtitle: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    display: false,
                  },
                  y: {
                    display: false,
                    ticks: {
                      display: false,
                    },
                  },
                },
              }}
            />
          </div>
          <span className="routing-results-display-text routing-results-clickable-text">
            {elevation} m
          </span>
        </div>
      </div>
      {props.start && props.dest && (
        <div id="enturRow">
          <a
            href="https://entur.no/reiseresultater?…"
            target="_blank"
            rel="noreferrer"
            onClick={enturTravelHandler}
          >
            Reis med Entur
          </a>
        </div>
      )}
      <Modal
        id="elevationInfo"
        aria-labelledby="modal-title"
        open={showElevationPopup}
        onClose={() => setShowElevationPopup(false)}
      >
        <Box sx={modalGraphStyle} className="modal-box">
          <Line
            datasetIdKey="id"
            className="elevation-details-modal"
            data={{
              labels: props.elevationProfile ?? [],
              datasets: [
                {
                  data: props.elevationProfile,
                  fill: "origin",
                  borderColor: "#000000",
                  borderWidth: 1,
                  backgroundColor: "rgba(0,0,0,0.4)",
                  showLine: false,
                  pointRadius: 0,
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
                  text: "Høydeprofil i meter",
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
