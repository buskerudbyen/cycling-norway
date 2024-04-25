import React from "react";
import { Popup } from "react-map-gl";
import opening_hours from "opening_hours";
import { SimpleOpeningHours } from "simple-opening-hours";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import moment from "moment";
import "moment/locale/nb";
import { DAYS } from "./InfoPopup";
import { DayShortName, PopupProps, PopupProperties } from "./types";

const TunnelPopup = ({popup}: {popup: PopupProps}) => {
  const parseOpeningHours = (oh?: string, startString?: string) => {
    if (oh === undefined || startString === undefined) {
      return;
    }

    if (oh.startsWith("no")) {
      return startString + oh.split("(")[1].split(")")[0];
    }

    if (oh === "24/7") {
      return startString + DAYS.get("mo") + " til " + DAYS.get("su") + ".";
    }

    // display opening hours for the next 24 hours
    const ohObject = new opening_hours(oh);
    const today = new Date();
    const tomorrow = new Date();
    today.setHours(0, 0, 0, 0);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const intervals = ohObject.getOpenIntervals(today, tomorrow);
    return (
      startString +
      getTime(intervals[0][0]) +
      " til " +
      getTime(intervals[0][1]) +
      "."
    );
  };

  const getTime = (fullDate: Date) => {
    moment.locale("nb");
    return moment(fullDate).format("LT");
  };

  const getMessage = (point: PopupProperties) => {
    if (point.hasOwnProperty("opening_hours")) {
      return parseOpeningHours(point.opening_hours, "Tunnel åpen ");
    }

    if (point.hasOwnProperty("lit")) {
      if (point.lit === "no") {
        return "Tunnel uten lys.";
      } else if (point.lit === "24/7") {
        return "Tunnel med lys.";
      } else {
        return parseOpeningHours(point.lit, "Tunnel med lys kun ");
      }
    }

    if (point.hasOwnProperty("conditional_bike")) {
      return parseOpeningHours(point.conditional_bike, "Anlegg stengt kl. ");
    }
  };

  const getOpeningHoursValue = (point: PopupProperties) => {
    if (point.hasOwnProperty("opening_hours")) {
      return point.opening_hours;
    }

    if (point.hasOwnProperty("lit")) {
      return point.lit;
    }

    if (point.hasOwnProperty("conditional_bike")) {
      return point.conditional_bike;
    }
  };

  const getOpeningHoursTable = (point: PopupProperties) => {
    const oh = getOpeningHoursValue(point);

    // If there are multiple rules.
    if (oh !== undefined && oh.split(";").length - 1 > 1) {
      const ohObject = new SimpleOpeningHours(oh);
      const openingHours = ohObject.getTable() as {
        [key in DayShortName]: string;
      };

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
      latitude={popup.lngLat[1]}
      longitude={popup.lngLat[0]}
      onClose={popup.onClose}
    >
      <Typography gutterBottom>{getMessage(popup.point)}</Typography>
      {getOpeningHoursTable(popup.point)}
    </Popup>
  );
};

export default TunnelPopup;
