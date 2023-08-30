import React from "react";
import {Popup} from "react-map-gl";
import {Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";
import {SimpleOpeningHours} from "simple-opening-hours";
import {DAYS} from "./InfoPopup";

class ToiletPopup extends React.Component {
	
	getOpeningHoursTable() {
		if (!this.props.point.hasOwnProperty('opening_hours')) {
			return null;
		}
		
		const oh = this.props.point['opening_hours'];
		
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
				<Typography>Alle toaletter kan ha åpingstider, der for eksempel bygget ellers er stengt, eller være stengt i perioder (fellesferie, vinteren, for vedlikehold, etc.).</Typography>
				<Typography>Betaling: {this.props.point["fee"] === "yes" ? "ja" : "nei"}</Typography>
				{this.getOpeningHoursTable()}
			</Popup>
		);
	}
}

export default ToiletPopup;
