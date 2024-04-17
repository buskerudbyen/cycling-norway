import { CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import Map from "../../src/components/Map";

type WidgetOptions = {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

declare global {
  interface Window {
    CyclingWidget: (options?: WidgetOptions) => void;
  }
}

// FIXME: This is just a demo, must be split into <Demo> and <CyclingWidget>
export const CyclingWidget = (props: WidgetOptions) => {
  return (
    <div>
      <h1>Biking Widget</h1>
      <p>The map is now wrapped in the widget component.</p>
      <div style={{ width: props.width ?? 700, height: props.height ?? 450 }}>
        <Map isWidget />
      </div>
    </div>
  );
};

window.CyclingWidget = (options?: WidgetOptions) => {
  const domNode = document.getElementById("cycling-widget");
  if (domNode !== null) {
    const root = createRoot(domNode);
    root.render(
      <CyclingWidget width={options?.width} height={options?.height} />
    );
  } else {
    console.error(
      'Did you remember to add a <div id="cycling-widget"></div> to your HTML?'
    );
  }
};

console.log(
  "Run CyclingWidget({ …options… }) to render the Sykkelveier.no Widget."
);
window.CyclingWidget({ width: "100%", height: "100%" });
