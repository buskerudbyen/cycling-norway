import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import ButtonHelp from "./ButtonHelp";
import SearchField from "./SearchField";
import RoutingResults from "./RoutingResults";
import { Feature } from "../types";
import useResponsiveness from "./useResponsiveness";

type Props = {
  chooseStart: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
  chooseDest: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
  reset: () => void;
  duration: number | null;
  distance: number | null;
  elevation: number | null;
  elevationProfile: number[] | null;
};

/**
 * The Menu. In App mode.
 */
const Menu = (props: Props) => {
  const [renderFormKeys, setRenderFormKeys] = useState(true);
  const prevWidth = useResponsiveness();
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 460
  );
  useEffect(() => setSearchFieldsOpen(prevWidth >= 460), [prevWidth]);

  const resetRoute = () => {
    props.reset();
    setRenderFormKeys(!renderFormKeys);
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
          onChoose={props.chooseStart}
          labelText="Fra"
          rerender={renderFormKeys}
        />
        <SearchField
          onChoose={props.chooseDest}
          labelText="Til"
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

export default Menu;