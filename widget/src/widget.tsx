import { Button, Link, TextField, Typography } from "@mui/material";
import { type CSSProperties, type SyntheticEvent, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMap from "../../src/components/Map";
import AddressField, { type Feature } from "./AddressField";
import type { Position } from "geojson";
import "./widget.css";

type WidgetOptions = {
  dest?: Position;
  destDescription?: string;
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
      <ReactMap
        isWidget
        dest={props.dest}
        destDescription={props.destDescription}
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
      'Did you remember to add a <div id="cycling-widget"></div> to your HTML?',
    );
  }
};
console.log(
  "Run CyclingWidget({ …options… }) to render the Sykkelveier.no Widget.",
);

/**
 * This is a demo to show that the widget actually works.
 *
 * The demo will automatically render a button that will load the widget when
 * clicked, as long as a <div id="cycling-demo-exists"> exists.
 */
export const Demo = () => {
  const [destDescription, _setDestDescription] = useState<string | undefined>();
  const setDestDescription = (value: string | undefined) => {
    if (value === undefined) {
      _setDestDescription(undefined);
    } else if (value.length <= 140) {
      // Should we have input sanitation here? Probably not necessary, the only
      // security risk seems to be XSS, and we're not rendering HTML.
      _setDestDescription(value);
    }
  };
  const [lat, setLat] = useState(59.74474);
  const [lng, setLng] = useState(10.20625);
  const [zoom, setZoom] = useState(10);
  return (
    <div className="cycling-demo-container">
      <Typography variant="h4" gutterBottom>
        Sykkelveier.no Widget Demo
      </Typography>
      <Typography variant="body1" gutterBottom>
        Destinasjonskart som kan legges inn på egen nettside: Dette er en widget som fremhever bruk av sykkel/elsparkesykkel til lokasjoner i Norge.
        Løsningen benytter seg av stedssøk fra Entur og sykkelløsninger fra mange andre kilder, men først og fremst OpenStreetMap og fra løsningen sykkelveier.no.
        Man kan bruke widgeten på egen webside uten forhåndssamtykke. Se under for instruksjoner om hvordan den kan benyttes.
      </Typography>
      <div className="cycling-demo-menu">
        <AddressField
          onChoose={(event: SyntheticEvent, value: Feature | string | null) => {
            if (typeof value !== "string" && value !== null) {
              setLat(value.geometry.coordinates[1]);
              setLng(value.geometry.coordinates[0]);
            }
          }}
        />
        <TextField
          id="outlined-basic"
          label="Destinasjonsbeskrivelse (max 280 chars)"
          multiline
          maxRows={4}
          onChange={(e) => {
            if (e.target.value.length === 0) {
              setDestDescription(undefined);
            } else if (e.target.value.length <= 140) {
              setDestDescription(e.target.value);
            }
          }}
          sx={{ width: 350 }}
          type="text"
          value={destDescription}
          variant="outlined"
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
          // Clear URL state
          window.history.replaceState(null, "", window.location.pathname);
          // Set widget height to 350px
          document
            .getElementById("cycling-widget")
            ?.style.setProperty("height", "350px");
          // Load the widget
          window.CyclingWidget({
            dest: [ lng, lat ],
            destDescription,
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
        <code>{`<script src="https://widget.sykkelveier.no/widget.js"></script>`}</code>
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
  dest: [ ${lng}, ${lat} ],
  destDescription: "${destDescription ?? "Frivillig beskrivelse her"}",
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
