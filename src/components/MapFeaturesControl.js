import React from "react";
import {Checkbox, FormLabel} from "@mui/material";

class MapFeaturesControl extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			layers: [
				{
					text: "Sykkelparkering",
					id: "poi-bicycle-parking-public",
					value: true
				},
				{
					text: "Sykkelreparasjonsstasjon",
					id: "poi-bicycle-repair-station",
					value: true
				}
			]
		};
	}
	
	getLayerActive = (layer) => {
		return (
			<div>
				<Checkbox
					id={"layer-" + layer.id}
					defaultChecked
					label={layer.text}
					value={layer.value}
					onChange={this.props.toggleLayer}
					size="small"
				/>
				<FormLabel htmlFor={"layer-" + layer.id}>{layer.text}</FormLabel>
			</div>
		);
	}
	
	render() {
		return (
			<div id="mapFeatures">
				<div className="maplibregl-ctrl maplibregl-ctrl-group layerSwitch">
					{this.getLayerActive(this.state.layers[0])}
					{this.getLayerActive(this.state.layers[1])}
				</div>
			</div>
		);
	}
}

export default MapFeaturesControl;
