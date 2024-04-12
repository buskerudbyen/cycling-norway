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

const TunnelPopup = (props) => {
  const parseOpeningHours = (oh, startString) => {
    if (oh === undefined) {
      return;
    }

    if (oh.startsWith("no")) {
      return startString + oh.split("(")[1].split(")")[0];
    }

    if (oh === "24/7") {
      return startString + DAYS["mo"] + " til " + DAYS["su"] + ".";
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

  const getTime = (fullDate) => {
    moment.locale("nb");
    return moment(fullDate).format("LT");
  };

  const getMessage = (point) => {
    if (point.hasOwnProperty("opening_hours")) {
      return parseOpeningHours(point["opening_hours"], "Tunnel åpen ");
    }

    if (point.hasOwnProperty("lit")) {
      if (point["lit"] === "no") {
        return "Tunnel uten lys.";
      } else if (point["lit"] === "24/7") {
        return "Tunnel med lys.";
      } else {
        return parseOpeningHours(point["lit"], "Tunnel med lys kun ");
      }
    }

    if (point.hasOwnProperty("conditional_bike")) {
      return parseOpeningHours(point["conditional_bike"], "Anlegg stengt kl. ");
    }
  };

  const getOpeningHoursValue = (point) => {
    if (point.hasOwnProperty("opening_hours")) {
      return point["opening_hours"];
    }

    if (point.hasOwnProperty("lit")) {
      return point["lit"];
    }

    if (point.hasOwnProperty("conditional_bike")) {
      return point["conditional_bike"];
    }
  };

  const getOpeningHoursTable = (point) => {
    const oh = getOpeningHoursValue(point);

    // If there are multiple rules.
    if (oh.split(";").length - 1 > 1) {
      const ohObject = new SimpleOpeningHours(oh);
      const openingHours = ohObject.getTable();

      let rows = [];
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
      <Typography gutterBottom>{getMessage(props.point)}</Typography>
      {getOpeningHoursTable(props.point)}
    </Popup>
  );
};

export default TunnelPopup;
