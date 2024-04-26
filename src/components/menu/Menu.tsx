import type React from "react";
import { useEffect, useState } from "react";
import type { Coords, Feature } from "../types";
import ButtonHelp from "./ButtonHelp";
import ButtonResetRoute from "./ButtonResetRoute";
import ButtonToggleMenu from "./ButtonToggleMenu";
import RoutingResults from "./RoutingResults";
import SearchField from "./SearchField";
import useResponsiveness from "./useResponsiveness";

type Props = {
  chooseStart: (
    event: React.SyntheticEvent,
    value: Feature | string | null,
  ) => void;
  chooseDest: (
    event: React.SyntheticEvent,
    value: Feature | string | null,
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
 * The Menu. In App mode.
 */
const Menu = (props: Props) => {
  const [renderFormKeys, setRenderFormKeys] = useState(true);
  const prevWidth = useResponsiveness();
  const [searchFieldsOpen, setSearchFieldsOpen] = useState(
    window.innerWidth >= 420,
  );
  useEffect(() => setSearchFieldsOpen(prevWidth >= 420), [prevWidth]);

  const resetRoute = () => {
    props.reset();
    setRenderFormKeys(!renderFormKeys);
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
        <div style={{ zIndex: 1 }}>
          <SearchField
            className="top"
            onChoose={props.chooseStart}
            labelText="Fra"
            rerender={renderFormKeys}
          />
          <SearchField
            className="bottom"
            onChoose={props.chooseDest}
            labelText="Til"
            rerender={renderFormKeys}
          />
        </div>
        <RoutingResults
          distance={props.distance}
          duration={props.duration}
          elevation={props.elevation}
          elevationProfile={props.elevationProfile}
          start={props.start}
          dest={props.dest}
        />
      </div>
    </>
  );
};

export default Menu;
