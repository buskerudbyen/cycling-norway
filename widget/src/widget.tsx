import { CSSProperties, useState } from "react";
import { createRoot } from "react-dom/client";
import Map from "../../src/components/Map";
import "./widget.css";

type WidgetOptions = {
  dest?: { lat: number; lng: number };
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
      <Map dest={props.dest} isWidget />
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
  return (
    <div className="cycling-demo-container">
      <h2 className="cycling-demo-heading">Sykkelveier.no Widget Demo</h2>
      <p>This is a simple demo page for the Sykkelveier.no Widget.</p>
      <div className="cycling-demo-menu">
        <label className="cycling-demo-label">
          Dest Lat
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(+e.target.value)}
          />
        </label>
        <label className="cycling-demo-label">
          Dest Lng
          <input
            type="number"
            value={lng}
            onChange={(e) => setLng(+e.target.value)}
          />
        </label>
      </div>
      <button
        className="cycling-demo-load-widget"
        onClick={() =>
          window.CyclingWidget({
            dest: { lat, lng },
            width: "100%",
            height: "100%",
          })
        }
      >
        Load Widget
      </button>
    </div>
  );
};
const rootNode = document.getElementById("cycling-widget-demo");
if (rootNode !== null) {
  const root = createRoot(rootNode);
  root.render(<Demo />);
}
