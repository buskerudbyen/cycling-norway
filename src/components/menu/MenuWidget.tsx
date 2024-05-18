import type React from "react";
import { type MouseEvent, useEffect, useState } from "react";
import type { Position } from "geojson";
import type { MapFeature, Trip } from "../types";
import ButtonHelp from "./ButtonHelp";
import ButtonResetRoute from "./ButtonResetRoute";
import ButtonToggleMenu from "./ButtonToggleMenu";
import MyLocation from "./MyLocation";
import RoutingResults from "./RoutingResults";
import SearchField from "./SearchField";
import useResponsiveness from "./useResponsiveness";

const geoLocationOptions: PositionOptions = {
  // TODO: Experiment with these options to see if we can speed up geolocation
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

type Props = {
  chooseStart: (
    event: React.SyntheticEvent | null,
    value: MapFeature | string | null,
  ) => void;
  reset: () => void;
  start: Position | null;
  dest: Position | null;
  trip: Trip | null;
};

/**
 * The Menu. In Widget mode.
 */
const MenuWidget = (props: Props) => {
  const [renderFormKeys, setRenderFormKeys] = useState(true);
  const prevWidth = useResponsiveness();
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 420,
  );
  const [waitingForGeolocation, setWaitingForGeolocation] = useState(false);
  const [isYourLocation, setIsYourLocation] = useState(false);

  useEffect(() => setSearchFieldsOpen(prevWidth >= 420), [prevWidth]);

  const resetRoute = () => {
    props.reset();
    setIsYourLocation(false);
    setRenderFormKeys(!renderFormKeys);
  };

  const successCallback: PositionCallback = (position: GeolocationPosition) => {
    setWaitingForGeolocation(false);
    setIsYourLocation(true);
    const { latitude, longitude } = position.coords;
    props.chooseStart(null, {
      type: "Feature",
      geometry: { type: "Point", coordinates: [longitude, latitude] },
    } as MapFeature);
  };

  const errorCallback: PositionErrorCallback = (
    error: GeolocationPositionError,
  ) => {
    setWaitingForGeolocation(false);
    // TODO: Show the user that we failed to get geolocation
    console.error(error);
  };

  return (
    <>
      <div className="menu">
        <ButtonToggleMenu
          searchFieldsOpen={searchFieldsOpen}
          setSearchFieldsOpen={setSearchFieldsOpen}
        />
        <ButtonResetRoute resetRoute={resetRoute} />
        <ButtonHelp />
      </div>
      <div
        id="routing"
        style={{ display: searchFieldsOpen ? "block" : "none" }}
      >
        <SearchField
          endAdornment={
            <MyLocation
              waitingForGeolocation={waitingForGeolocation}
              setWaitingForGeolocation={setWaitingForGeolocation}
              clickHandler={(e: MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                setWaitingForGeolocation(true);
                navigator.geolocation.getCurrentPosition(
                  successCallback,
                  errorCallback,
                  geoLocationOptions,
                );
              }}
            />
          }
          onChoose={props.chooseStart}
          labelText={isYourLocation ? "Din posisjon" : "Sykle fra"}
          rerender={renderFormKeys}
        />
        <RoutingResults
          trip={props.trip}
          start={props.start}
          dest={props.dest}
        />
      </div>
    </>
  );
};

export default MenuWidget;
