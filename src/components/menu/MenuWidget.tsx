import React, { MouseEvent, useEffect, useState } from "react";
import { Button } from "@mui/material";
import ButtonHelp from "./ButtonHelp";
import SearchField from "./SearchField";
import RoutingResults from "./RoutingResults";
import { Feature } from "../types";
import useResponsiveness from "./useResponsiveness";
import MyLocation from "./MyLocation";

const geoLocationOptions: PositionOptions = {
  // TODO: Experiment with these options to see if we can speed up geolocation
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

type Props = {
  chooseStart: (
    event: React.SyntheticEvent | null,
    value: Feature | string | null
  ) => void;
  reset: () => void;
  duration: number | null;
  distance: number | null;
  elevation: number | null;
  elevationProfile: number[] | null;
};

/**
 * The Menu. In Widget mode.
 */
const MenuWidget = (props: Props) => {
  const [renderFormKeys, setRenderFormKeys] = useState(true);
  const prevWidth = useResponsiveness();
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 460
  );
  const [waitingForGeolocation, setWaitingForGeolocation] = useState(false);
  const [isYourLocation, setIsYourLocation] = useState(false);

  useEffect(() => setSearchFieldsOpen(prevWidth >= 460), [prevWidth]);

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
      type: "feature",
      geometry: { type: "Point", coordinates: [longitude, latitude] },
    });
  };

  const errorCallback: PositionErrorCallback = (
    error: GeolocationPositionError
  ) => {
    setWaitingForGeolocation(false);
    // TODO: Show the user that we failed to get geolocation
    console.error(error);
  };

  return (
    <>
      <div className="menu">
        <Button
          id="searchFieldsButton"
          variant="contained"
          size="small"
          onClick={() => setSearchFieldsOpen(!searchFieldsOpen)}
        >
          Tekstsøk
        </Button>
        <Button
          id="reset"
          variant="contained"
          size="small"
          onClick={resetRoute}
        >
          Nullstill rute
        </Button>
        <ButtonHelp />
      </div>
      <div id="routing" hidden={!searchFieldsOpen}>
        <SearchField
          disableClearable
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
                  geoLocationOptions
                );
              }}
            />
          }
          onChoose={props.chooseStart}
          labelText={isYourLocation ? "Din posisjon" : "Fra"}
          rerender={renderFormKeys}
        />
        <RoutingResults
          distance={props.distance}
          duration={props.duration}
          elevation={props.elevation}
          elevationProfile={props.elevationProfile}
        />
      </div>
    </>
  );
};

export default MenuWidget;
