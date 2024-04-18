import React, { MouseEvent } from "react";
import { IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";

type Props = {
  waitingForGeolocation: boolean;
  setWaitingForGeolocation: (value: boolean) => void;
  clickHandler: (event: MouseEvent<HTMLButtonElement>) => void;
};

const MyLocation = (props: Props) => (
  <IconButton
    disabled={
      navigator.geolocation === undefined || props.waitingForGeolocation
    }
    onClick={props.clickHandler}
    title="Naviger fra din posisjon"
  >
    <MyLocationIcon />
  </IconButton>
);

export default MyLocation;
