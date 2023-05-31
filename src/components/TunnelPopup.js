import React from "react";
import {Popup} from "react-map-gl";
import opening_hours from "opening_hours";
import {SimpleOpeningHours} from "simple-opening-hours";
import {Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";

const DAYS = {
	"Mo": "mandag",
	"Tu": "tirsdag",
	"We": "onsdag",
	"Th": "torsdag",
	"Fr": "fredag",
	"Sa": "lørdag",
	"Su": "søndag"
}

class TunnelPopup extends React.Component {
	
	parseOpeningHours(oh, startString) {
		if (oh === undefined) {
			return;
		}
		
		if (oh.startsWith('no')) {
			return startString + oh.split("(")[1].split(")")[0];
		}
		
		if (oh === "24/7") {
			return startString + DAYS['Mo'] + " til " + DAYS['Su'] + "." ;
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
		return fullDate.toLocaleTimeString();
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
			return ohObject.getTable();
		}
		return null;
	}
	
	render() {
		const openingHours = this.getOpeningHoursTable(this.props.point)
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<Typography gutterBottom={true}>{this.getMessage(this.props.point)}</Typography>
				{openingHours != null &&
					<Table padding={'none'} size={'small'}>
						<TableBody>
							<TableRow>
								<TableCell>{DAYS['Mo']}</TableCell>
								<TableCell>{openingHours['mo']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['Tu']}</TableCell>
								<TableCell>{openingHours['tu']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['We']}</TableCell>
								<TableCell>{openingHours['we']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['Th']}</TableCell>
								<TableCell>{openingHours['th']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['Fr']}</TableCell>
								<TableCell>{openingHours['fr']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['Sa']}</TableCell>
								<TableCell>{openingHours['sa']}</TableCell>
							</TableRow>
							<TableRow>
								<TableCell>{DAYS['Su']}</TableCell>
								<TableCell>{openingHours['su']}</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				}
			</Popup>
		);
	}
	
}

export default TunnelPopup;
