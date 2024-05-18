import type React from "react";
import { useEffect, useState } from "react";
import type { MapFeature, Trip } from "../types";
import ButtonHelp from "./ButtonHelp";
import ButtonResetRoute from "./ButtonResetRoute";
import ButtonToggleMenu from "./ButtonToggleMenu";
import RoutingResults from "./RoutingResults";
import SearchField from "./SearchField";
import useResponsiveness from "./useResponsiveness";

type Props = {
  chooseStart: (
    event: React.SyntheticEvent,
    value: MapFeature | string | null,
  ) => void;
  chooseDest: (
    event: React.SyntheticEvent,
    value: MapFeature | string | null,
  ) => void;
  reset: () => void;
  start: number[] | null;
  dest: number[] | null;
  trip: Trip | null;
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
          trip={props.trip}
          start={props.start}
          dest={props.dest}
        />
      </div>
    </>
  );
};

export default Menu;
