import React from "react";
import {Popup} from "react-map-gl";

class BikeRoutePopup extends React.Component {

	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<h3>{this.props.point['name']}</h3>
				<h4>{this.props.point['from']} - {this.props.point['to']}</h4>
				<div align={'justify'}>{this.props.point['description']}</div>
			</Popup>
		);
	}

}

export default BikeRoutePopup;
