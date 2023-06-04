import React from "react";
import {Popup} from "react-map-gl";
import opening_hours from "opening_hours";
import {SimpleOpeningHours} from "simple-opening-hours";
import {Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";
import moment from "moment";
import 'moment/locale/nb';

const DAYS = new Map([
	["mo", "mandag"],
	["tu", "tirsdag"],
	["we", "onsdag"],
	["th", "torsdag"],
	["fr", "fredag"],
	["sa", "lørdag"],
	["su", "søndag"]
]);

class TunnelPopup extends React.Component {
	
	parseOpeningHours(oh, startString) {
		if (oh === undefined) {
			return;
		}
		
		if (oh.startsWith('no')) {
			return startString + oh.split("(")[1].split(")")[0];
		}
		
		if (oh === "24/7") {
			return startString + DAYS['mo'] + " til " + DAYS['su'] + "." ;
		}
		
		// display opening hours for the next 24 hours
		const ohObject = new opening_hours(oh);
		const today = new Date();
		const tomorrow = new Date();
		today.setHours(0, 0, 0, 0);
		tomorrow.setDate(today.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		const intervals = ohObject.getOpenIntervals(today, tomorrow);
		return startString + this.getTime(intervals[0][0]) + " til " + this.getTime(intervals[0][1]) + ".";
	}
	
	getTime(fullDate) {
		moment.locale('nb');
		return moment(fullDate).format('LT');
	}
	
	getMessage(point) {
		if (point.hasOwnProperty('opening_hours')) {
			return this.parseOpeningHours(point['opening_hours'], "Tunnel åpen ");
		}
		
		if (point.hasOwnProperty('lit')) {
			if (point['lit'] === 'no') {
				return "Tunnel uten lys.";
			} else if (point['lit'] === '24/7') {
				return "Tunnel med lys.";
			} else {
				return this.parseOpeningHours(point['lit'], "Tunnel med lys kun ");
			}
		}
		
		if (point.hasOwnProperty('conditional_bike')) {
			return this.parseOpeningHours(point['conditional_bike'], "Anlegg stengt kl. ");
		}
	}
	
	getOpeningHoursValue(point) {
		if (point.hasOwnProperty('opening_hours')) {
			return point['opening_hours'];
		}
		
		if (point.hasOwnProperty('lit')) {
			return point['lit'];
		}
		
		if (point.hasOwnProperty('conditional_bike')) {
			return point['conditional_bike'];
		}
	}
	
	getOpeningHoursTable(point) {
		const oh = this.getOpeningHoursValue(point);
		
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
			})
			
			return (
				<Table padding={'none'} size={'small'}>
					<TableBody>
						{rows}
					</TableBody>
				</Table>
			);
		}
		return null;
	}
	
	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<Typography gutterBottom={true}>{this.getMessage(this.props.point)}</Typography>
				{this.getOpeningHoursTable(this.props.point)}
			</Popup>
		);
	}
	
}

export default TunnelPopup;
