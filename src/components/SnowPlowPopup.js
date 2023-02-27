import React from "react";
import {Popup} from "react-map-gl";

class SnowPlowPopup extends React.Component {
	
	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<h3>Snow plow information</h3>
				<div>This route has been plowed {this.props.point.isOld ? "more than 3 hours ago" : "in the last 3 hours"}.</div>
			</Popup>
		);
	}
	
}

export default SnowPlowPopup;
