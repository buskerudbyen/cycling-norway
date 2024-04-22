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
    sx={{ minWidth: "140px" }}
  >
    Nullstill rute
  </Button>
);

export default ButtonResetRoute;
