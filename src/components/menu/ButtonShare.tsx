import ShareIcon from "@mui/icons-material/Share";
import { Button } from "@mui/material";
import React, { type MutableRefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import { TARGET_URLS } from "../../assets/constants";

type Props = {
  map: MutableRefObject<MapRef | null>;
};

const ButtonShare = (props: Props) => {

  const isVisible = (layer: string) => {
    return props.map.current?.getLayoutProperty(layer, "visibility") === "visible";
  };

  const copyQueryWithLegendState = () => {
    const url = new URL(window.location.href);
    const visibleLayers: string[] = [];

    TARGET_URLS.forEach((param, poi) => {
      if (isVisible(poi)) {
        visibleLayers.push(param);
      }
    });

    url.searchParams.set("layers", visibleLayers.join(","));

    // Copy the text inside the text field
    navigator.clipboard.writeText(url.toString());

    // Alert the copied text
    alert(`Copied the text: ${url.toString()}`);
  };

  return (
    <Button
      id="show-help"
      variant="outlined"
      size="small"
      onClick={() => copyQueryWithLegendState()}
      sx={{
        backgroundColor: "white",
        minWidth: "unset",
        boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
        border: "0",
        ":hover": { backgroundColor: "white", border: "0" },
      }}
    >
      <ShareIcon htmlColor="gray" />
    </Button>
  );
};

export default ButtonShare;
