import React, { MouseEvent, useEffect, useState } from "react";
import { Button } from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import ButtonHelp from "./ButtonHelp";
import SearchField from "./SearchField";
import RoutingResults from "./RoutingResults";
import { Coords, Feature } from "../types";
import useResponsiveness from "./useResponsiveness";
import MyLocation from "./MyLocation";
import ButtonToggleMenu from "./ButtonToggleMenu";
import ButtonResetRoute from "./ButtonResetRoute";

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
  start: Coords | null;
  dest: Coords | null;
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
    window.innerWidth >= 420
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
        <div className="flex-row">
          <SearchField
            className="left"
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
            labelText={isYourLocation ? "Din posisjon" : "Sykle fra"}
            rerender={renderFormKeys}
            sx={{ borderRadius: "4px 0px 0px 4px", width: '236px' }}
          />
          <Button
            disabled={props.start === null || props.dest === null}
            variant="contained"
            size="small"
            sx={{
              borderRadius: "0px 4px 4px 0px",
              boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1)",
              padding: "6px",
            }}
            onClick={() => {
              if (props.start !== null && props.dest !== null) {
                const enturUrl = `https://entur.no/reiseresultater?transportModes=rail%2Ctram%2Cbus%2Ccoach%2Cwater%2Ccar_ferry%2Cmetro%2Cflytog%2Cflybuss&date=${Date.now()}&tripMode=oneway&walkSpeed=1.3&minimumTransferTime=120&timepickerMode=departAfter&startLat=${
                  props.start.lat
                }&startLon=${props.start.lng}&stopLat=${
                  props.dest.lat
                }&stopLon=${props.dest.lng}`;
                window.open(enturUrl, "_blank")?.focus();
              }
            }}
          >
            <DirectionsBusIcon />
          </Button>
        </div>
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
