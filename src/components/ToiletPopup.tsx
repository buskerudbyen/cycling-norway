import React from "react";
import { Popup } from "react-map-gl";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { SimpleOpeningHours } from "simple-opening-hours";
import { DAYS } from "./InfoPopup";
import { OpeningHourTable, PopupProps } from "./types";

const ToiletPopup = (props: PopupProps) => {
  const getOpeningHoursTable = () => {
    if (props.point.opening_hours === undefined) return null;

    const oh = props.point.opening_hours;

    // If there are multiple rules.
    if (oh.split(";").length - 1 > 1) {
      const ohObject = new SimpleOpeningHours(oh);
      const openingHours = ohObject.getTable() as OpeningHourTable;

      const rows: JSX.Element[] = [];
      DAYS.forEach((value, key) => {
        rows.push(
          <TableRow>
            <TableCell>{value}</TableCell>
            <TableCell>{openingHours[key]}</TableCell>
          </TableRow>
        );
      });

      return (
        <Table padding="none" size="small">
          <TableBody>{rows}</TableBody>
        </Table>
      );
    }
    return null;
  };

  return (
    <Popup
      latitude={props.lngLat.lat}
      longitude={props.lngLat.lng}
      onClose={props.onClose}
    >
      <Typography>
        Alle toaletter kan ha åpingstider, der for eksempel bygget ellers er
        stengt, eller være stengt i perioder (fellesferie, vinteren, for
        vedlikehold, etc.).
      </Typography>
      <Typography>
        Betaling: {props.point.fee === "yes" ? "ja" : "nei"}
      </Typography>
      {getOpeningHoursTable()}
    </Popup>
  );
};

export default ToiletPopup;
