import { Button } from "@mui/material";
import React, { useState } from "react";
import { Popup } from "react-map-gl";
import type { Network, PopupPropsForBikeRoute, RouteProperties } from "../types";

/**
 * The routes can have multiple points (is a list). If there are multiple
 * elements, the user has to choose one to see its details.
 */
const BikeRoutePopup = ({popup}: {popup: PopupPropsForBikeRoute}) => {
  const [multiple, setMultiple] = useState(popup.routes.length > 1);
  const [chosenRoute, setChosenRoute] = useState<RouteProperties | null>(
    popup.routes.length === 1 ? popup.routes[0] : null,
  );

  const chooseRoute = (route: RouteProperties) => {
    setMultiple(false);
    setChosenRoute(route);
  };

  const getNetwork = (network: Network | undefined) => {
    if (network === "international") return "(internasjonal)";
    if (network === "national") return "(nasjonal)";
    if (network === "regional") return "(regional)";
    if (network === "local") return "(lokal)";
    console.warn(`Unknown network type: "${network}"`);
    return "";
  };

  const getMultipleRoutesPopup = () => {
    // @ts-expect-error
    const [hasDetails, noDetails] = popup.routes.reduce(
      (arr, cur) => {
        arr[
          cur.from ||
          cur.to ||
          cur.description ||
          cur.website
            ? 0
            : 1
        ].push(cur);
        return arr;
      },
      [[], []] as [hasDetails: RouteProperties[], noDetails: RouteProperties[]],
    );

    const rowsEnabled: JSX.Element[] = [];
    for (const r of hasDetails) {
      rowsEnabled.push(
        <Button
          key={r.name}
          className="routeChoice"
          variant="outlined"
          size="small"
          onClick={() => chooseRoute(r)}
        >
          {r.name}
        </Button>,
      );
    }
    const rowsDisabled: JSX.Element[] = [];
    for (const r of noDetails) {
      if (r.name === undefined) {
        continue;
      }
      rowsDisabled.push(
        <Button
          key={r.name}
          className="routeChoice"
          variant="outlined"
          size="small"
          disabled
          onClick={() => chooseRoute(r)}
        >
          {r.name}
        </Button>,
      );
    }

    return (
      <Popup
        latitude={popup.lngLat[1]}
        longitude={popup.lngLat[0]}
        onClose={popup.onClose}
      >
        <h4>Flere sykkelruter funnet. Vennligst velg:</h4>
        {rowsEnabled}
        {rowsDisabled}
      </Popup>
    );
  };

  const getSingleRoutePopup = () => {
    const route = chosenRoute!;
    const hasFromTo = route.from && route.to;
    const hasDesc = route.description;
    const hasWebsite = route.website;

    return (
      <Popup
        latitude={popup.lngLat[1]}
        longitude={popup.lngLat[0]}
        onClose={popup.onClose}
      >
        <h3>
          {route.name} {getNetwork(route.network)}
        </h3>
        {hasFromTo && (
          <h4>
            {route.from} - {route.to}
          </h4>
        )}
        {hasDesc && (
          <div style={{ textAlign: "justify" }}>{route.description}</div>
        )}
        {hasWebsite && (
          <div>
            <a href={route.website} rel="noreferrer" target="_blank">
              Webside med mer informasjon
            </a>
          </div>
        )}
      </Popup>
    );
  };

  return multiple ? getMultipleRoutesPopup() : getSingleRoutePopup();
};

export default BikeRoutePopup;
