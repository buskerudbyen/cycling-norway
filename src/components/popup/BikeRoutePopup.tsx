import React, { useState } from "react";
import { Popup } from "react-map-gl";
import { Button } from "@mui/material";
import { Network, PopupPropsForBikeRoute, Route } from "../types";

/**
 * The props.point can have multiple points (is a list). If there are multiple
 * elements, the user has to choose one to see its details.
 */
const BikeRoutePopup = (props: PopupPropsForBikeRoute) => {
  const [multiple, setMultiple] = useState(props.point.length > 1);
  const [chosenRoute, setChosenRoute] = useState<Route | null>(
    props.point.length === 1 ? props.point[0] : null
  );

  const chooseRoute = (route: Route) => {
    setMultiple(false);
    setChosenRoute(route);
  };

  const getNetwork = (network: Network) => {
    if (network === "international") return "(internasjonal)";
    if (network === "national") return "(nasjonal)";
    if (network === "regional") return "(regional)";
    if (network === "local") return "(lokal)";
    console.warn(`Unknown network type: "${network}"`);
    return "";
  };

  const getMultipleRoutesPopup = () => {
    const [hasDetails, noDetails] = props.point.reduce(
      (arr, cur) => {
        arr[
          cur.properties.from ||
          cur.properties.to ||
          cur.properties.description ||
          cur.properties.website
            ? 0
            : 1
        ].push(cur);
        return arr;
      },
      [[], []] as [hasDetails: Route[], noDetails: Route[]]
    );

    const rowsEnabled: JSX.Element[] = [];
    for (const r of hasDetails) {
      rowsEnabled.push(
        <Button
          key={r.properties.name}
          className="routeChoice"
          variant="outlined"
          size="small"
          onClick={() => chooseRoute(r)}
        >
          {r.properties["name"]}
        </Button>
      );
    }
    const rowsDisabled: JSX.Element[] = [];
    for (const r of noDetails) {
      rowsDisabled.push(
        <Button
          key={r.properties.name}
          className="routeChoice"
          variant="outlined"
          size="small"
          disabled
          onClick={() => chooseRoute(r)}
        >
          {r.properties.name}
        </Button>
      );
    }

    return (
      <Popup
        latitude={props.lngLat.lat}
        longitude={props.lngLat.lng}
        onClose={props.onClose}
      >
        <h4>Flere sykkelruter funnet. Vennligst velg:</h4>
        {rowsEnabled}
        {rowsDisabled}
      </Popup>
    );
  };

  const getSingleRoutePopup = () => {
    const route = chosenRoute!.properties;
    const hasFromTo = route.from && route.to;
    const hasDesc = route.description;
    const hasWebsite = route.website;

    return (
      <Popup
        latitude={props.lngLat.lat}
        longitude={props.lngLat.lng}
        onClose={props.onClose}
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
