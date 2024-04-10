import React from "react";
import { createRoot } from "react-dom/client";

// FIXME: This is just a tech test to ensure the setup works.

const CyclingWidget = (props: any) => {
  return (
    <div>
      <h1>Biking Widget</h1>
      <p>How would you rate your biking experience?</p>
      <button onClick={() => alert("good")}>Good</button>
      <button onClick={() => alert("bad")}>Bad</button>
    </div>
  );
};

(window as any).CyclingWidget = (options: any) => {
  const domNode = document.getElementById("cycling-widget");
  if (domNode !== null) {
    const root = createRoot(domNode);
    root.render(<CyclingWidget />);
  } else {
    console.error(
      'Did you remember to add a <div id="cycling-widget"></div> to your HTML?'
    );
  }
};

console.log("Run CyclingWidget() to render the widget.");
