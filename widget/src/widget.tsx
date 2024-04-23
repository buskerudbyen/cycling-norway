import { CSSProperties, SyntheticEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Link, TextField, Typography } from "@mui/material";
import AddressField, { Feature } from "./AddressField";
import Map from "../../src/components/Map";
import "./widget.css";

type WidgetOptions = {
  dest?: { lat: number; lng: number };
  zoom?: number;
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
  const [lat, setLat] = useState(59.74474);
  const [lng, setLng] = useState(10.20625);
  const [zoom, setZoom] = useState(10);
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
        <AddressField
          onChoose={(event: SyntheticEvent, value: string | Feature) => {
            if (typeof value !== "string") {
              setLat(value.geometry.coordinates[1]);
              setLng(value.geometry.coordinates[0]);
            }
          }}
        />
        <TextField
          id="outlined-basic"
          label="Initiell zoom"
          onChange={(e) => setZoom(+e.target.value)}
          sx={{ width: 100 }}
          type="number"
          value={zoom}
          variant="outlined"
        />
        {/* <FormControlLabel
          label="Vis zoom kontroll"
          control={
            <Checkbox
              checked={showZoomControls}
              onChange={(e) => setShowZoomControls(e.target.checked)}
            />
          }
        /> */}
      </div>
      <Button
        className="cycling-demo-load-widget"
        size="large"
        variant="contained"
        onClick={() => {
          document
            .getElementById("cycling-widget")
            ?.style.setProperty("height", "350px");
          window.CyclingWidget({
            dest: { lat, lng },
            zoom,
            width: "100%",
            height: "100%",
          });
        }}
      >
        Last inn widget
      </Button>
      <Typography variant="h4" gutterBottom>
        Hvordan bruke widgeten på ditt eget nettsted
      </Typography>
      <Typography variant="body1" gutterBottom>
        Kopier og lim inn denne koden i din HTML-fil, i &lt;head&gt;
      </Typography>
      <pre className="cycling-demo-code">
        <code>{`<script src="https://sykkelveier.no/widget.js"></script>`}</code>
      </pre>
      <Typography variant="body1" gutterBottom>
        Kopier og lim inn denne koden i din HTML-fil, i &lt;body&gt;
      </Typography>
      <pre className="cycling-demo-code">
        <code>{`<div id="cycling-widget"></div>`}</code>
      </pre>
      <Typography variant="body1" gutterBottom>
        Kopier og lim inn denne koden i JavaScript, eventuelt i en useEffect i
        React.
      </Typography>
      <pre className="cycling-demo-code">
        <code>
          {`window.CyclingWidget({
  dest: { lat: ${lat}, lng: ${lng} },
  zoom: ${zoom},
  width: "100%",
  height: "100%",
});`}
        </code>
      </pre>
    </div>
  );
};
const rootNode = document.getElementById("cycling-widget-demo");
if (rootNode !== null) {
  const root = createRoot(rootNode);
  root.render(<Demo />);
}
