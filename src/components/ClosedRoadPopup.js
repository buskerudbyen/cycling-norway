import React from "react";
import {Popup} from "react-map-gl";
import {Typography} from "@mui/material";

class ClosedRoadPopup extends React.Component {
	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<Typography>Usikkert vinterføre. Anlegg er merket med at det ikke måkes om vinteren.</Typography>
			</Popup>
		);
	}
}

export default ClosedRoadPopup;
