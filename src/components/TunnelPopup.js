import React from "react";
import {Popup} from "react-map-gl";

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
	
	parseOpeningHours(oh) {
		if (oh === undefined) {
			return;
		}
		
		let parts = [];
		parts[0] = oh.split("-")[0]; // from day
		parts[1] = oh.split("-")[1].split(" ")[0]; // to day
		parts[2] = oh.split(" ")[1]; // hours
		return parts;
	}
	
	getMessage(point) {
		if (point.hasOwnProperty('opening_hours')) {
			let parts = this.parseOpeningHours(point['opening_hours']);
			return parts !== undefined ? "Tunnel åpen " + DAYS[parts[0]] + " til " + DAYS[parts[1]] + " kl. " + parts[2] : '';
		}
		
		if (point.hasOwnProperty('lit')) {
			if (point['lit'] === 'no') {
				return "Tunnel uten lys.";
			} else {
				let parts = this.parseOpeningHours(point['lit']);
				return parts !== undefined ? "Tunnel med lys kun " + DAYS[parts[0]] + " til " + DAYS[parts[1]] + " kl. " + parts[2] : '';
			}
		}
		
		if (point.hasOwnProperty('conditional_bike')) {
			let oh = point['conditional_bike'];
			oh = oh.split("(")[1].split(")")[0];
			return "Anlegg stengt kl. " + oh;
		}
	}
	
	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<div>{this.getMessage(this.props.point)}</div>
			</Popup>
		);
	}
	
}

export default TunnelPopup;
