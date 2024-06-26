import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { Popup } from "react-map-gl";
import { SimpleOpeningHours } from "simple-opening-hours";
import type { OpeningHourTable, PopupProps } from "../types";
import { DAYS } from "./InfoPopup";

const ToiletPopup = ({popup}: {popup: PopupProps}) => {
  const getOpeningHoursTable = () => {
    if (popup.point.opening_hours === undefined) return null;

    const oh = popup.point.opening_hours;

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
          </TableRow>,
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
      latitude={popup.lngLat[0]}
      longitude={popup.lngLat[1]}
      onClose={popup.onClose}
    >
      <Typography>
        Alle toaletter kan ha åpingstider, der for eksempel bygget ellers er
        stengt, eller være stengt i perioder (fellesferie, vinteren, for
        vedlikehold, etc.).
      </Typography>
      <Typography>
        Betaling: {popup.point.fee === "yes" ? "ja" : "nei"}
      </Typography>
      {getOpeningHoursTable()}
    </Popup>
  );
};

export default ToiletPopup;
