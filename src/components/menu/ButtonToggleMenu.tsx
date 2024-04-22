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
    sx={{
      boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
      border: "0",
      ":hover": { border: "0", boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)" },
    }}
  >
    Rute
  </Button>
);

export default ButtonToggleMenu;
