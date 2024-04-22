import React from "react";
import { Button } from "@mui/material";

type Props = {
  searchFieldsOpen: boolean;
  setSearchFieldsOpen: (value: boolean) => void;
};

const ButtonToggleMenu = (props: Props) => (
  <Button
    id="searchFieldsButton"
    variant="contained"
    size="small"
    onClick={() => props.setSearchFieldsOpen(!props.searchFieldsOpen)}
  >
    Tekstsøk
  </Button>
);

export default ButtonToggleMenu;
