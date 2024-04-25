import React from "react";
import { Button } from "@mui/material";

type Props = {
  resetRoute: () => void;
};

const ButtonResetRoute = (props: Props) => (
  <Button
    id="reset"
    variant="contained"
    size="small"
    onClick={props.resetRoute}
    sx={{
      minWidth: "140px",
      boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)",
      border: "0",
      ":hover": { border: "0", boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.1)" },
    }}
  >
    Nullstill rute
  </Button>
);

export default ButtonResetRoute;
