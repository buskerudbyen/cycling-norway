import React from "react";
import {Popup} from "react-map-gl";

class BikelyPopup extends React.Component {

	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<h3>{this.props.point.name} ({this.props.point.id})</h3>
				<div>{this.props.point.note}</div>
			</Popup>
		);
	}
	
}

export default BikelyPopup;
