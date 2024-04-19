import { CSSProperties, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import Map from "../../src/components/Map";
import "./widget.css";

type WidgetOptions = {
  dest?: { lat: number; lng: number };
  zoom?: number;
  showZoomControls?: boolean;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

declare global {
  interface Window {
    CyclingWidget: (options?: WidgetOptions) => void;
  }
}

/**
 * This is the actual Widget component.
 */
export const CyclingWidget = (props: WidgetOptions) => {
  return (
    <div style={{ width: props.width ?? 700, height: props.height ?? 450 }}>
      <Map
        isWidget
        dest={props.dest}
        zoom={props.zoom}
        showZoomControls={props.showZoomControls}
      />
    </div>
  );
};
window.CyclingWidget = (options?: WidgetOptions) => {
  const cyclingWidgetDomNode = document.getElementById("cycling-widget");
  if (cyclingWidgetDomNode !== null) {
    const root = createRoot(cyclingWidgetDomNode);
    root.render(<CyclingWidget {...options} />);
  } else {
    console.error(
      'Did you remember to add a <div id="cycling-widget"></div> to your HTML?'
    );
  }
};
console.log(
  "Run CyclingWidget({ …options… }) to render the Sykkelveier.no Widget."
);

/**
 * This is a demo to show that the widget actually works.
 *
 * The demo will automatically render a button that will load the widget when
 * clicked, as long as a <div id="cycling-demo-exists"> exists.
 */
export const Demo = () => {
  const [lat, setLat] = useState(59.868);
  const [lng, setLng] = useState(10.322);
  const [zoom, setZoom] = useState(9);
  const [showZoomControls, setShowZoomControls] = useState(true);
  return (
    <div className="cycling-demo-container">
      <Typography variant="h4" gutterBottom>
        Sykkelveier.no Widget Demo
      </Typography>
      <Typography variant="body1" gutterBottom>
        Dette er en enkel demoside for Sykkelveier.no-widgeten. Du kan bruke
        widgeten uten forhåndssamtykke. Se vår kildekode for instruksjoner om
        hvordan du bruker widgeten på ditt eget nettsted:{" "}
        <Link
          href="https://github.com/buskerudbyen/cycling-norway/widget"
          target="_blank"
          rel="noreferrer"
        >
          https://github.com/buskerudbyen/cycling-norway/widget
        </Link>
      </Typography>
      <div className="cycling-demo-menu">
        <TextField
          id="outlined-basic"
          label="Destinasjon lat"
          onChange={(e) => setLat(+e.target.value)}
          type="number"
          value={lat}
          variant="outlined"
        />
        <TextField
          id="outlined-basic"
          label="Destinasjon lng"
          onChange={(e) => setLng(+e.target.value)}
          type="number"
          value={lng}
          variant="outlined"
        />
        <TextField
          id="outlined-basic"
          label="Initiell zoom"
          onChange={(e) => setZoom(+e.target.value)}
          type="number"
          value={zoom}
          variant="outlined"
        />
        <FormControlLabel
          label="Vis zoom kontroll"
          control={
            <Checkbox
              checked={showZoomControls}
              onChange={(e) => setShowZoomControls(e.target.checked)}
            />
          }
        />
      </div>
      <Button
        className="cycling-demo-load-widget"
        size="large"
        variant="contained"
        onClick={() =>
          window.CyclingWidget({
            dest: { lat, lng },
            zoom,
            showZoomControls, // FIXME: Trenger ikke denne
            width: "100%",
            height: "100%",
          })
        }
      >
        Last inn widget
      </Button>
    </div>
  );
};
const rootNode = document.getElementById("cycling-widget-demo");
if (rootNode !== null) {
  const root = createRoot(rootNode);
  root.render(<Demo />);
}
