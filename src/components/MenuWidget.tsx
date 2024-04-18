import React, { useEffect, useState } from "react";
import { Button, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ButtonHelp from "./ButtonHelp";
import SearchField from "./SearchField";
import RoutingResults from "./RoutingResults";
import { Feature } from "./types";

const geoLocationOptions: PositionOptions = {
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
  const [prevWidth, setPrevWidth] = useState(window.innerWidth);
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 450
  );
  const [renderFormKeys, setRenderFormKeys] = useState(true);
  const [waitingForGeolocation, setWaitingForGeolocation] = useState(false);

  useEffect(() => {
    const updateBySize = () => {
      if (prevWidth !== window.innerWidth) {
        setPrevWidth(window.innerWidth);
        setSearchFieldsOpen(window.innerWidth >= 460);
      }
    };
    window.addEventListener("resize", updateBySize);
    return () => window.removeEventListener("resize", updateBySize);
  }, [prevWidth]);

  const resetRoute = () => {
    props.reset();
    setRenderFormKeys(!renderFormKeys);
  };

  const successCallback: PositionCallback = (position: GeolocationPosition) => {
    setWaitingForGeolocation(false);
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
        <div id="searchFields">
          <SearchField
            onChoose={props.chooseStart}
            labelText="Fra"
            rerender={renderFormKeys}
          />
          <IconButton
            disabled={
              navigator.geolocation === undefined || waitingForGeolocation
            }
            onClick={() => {
              setWaitingForGeolocation(true);
              navigator.geolocation.getCurrentPosition(
                successCallback,
                errorCallback,
                geoLocationOptions
              );
            }}
            style={{
              // TODO: Relative positioning here is not great, consider fixing.
              position: "relative",
              left: prevWidth < 460 ? "172px" : "252px",
              top: "-53px",
            }}
          >
            <MyLocationIcon />
          </IconButton>
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
