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
	
	toggleLayer = (layer) => {
		// TODO
	}
	
	getLayerActive = (layer) => {
		return (
			<div className="layerSwitch">
				<Checkbox
					id={"layer-" + layer.id}
					defaultChecked
					label={layer.text}
					value={layer.value}
					onChange={this.toggleLayer(layer)}
				/>
				<FormLabel htmlFor={"layer-" + layer.id}>{layer.text}</FormLabel>
			</div>
		);
	}
	
	getLayerLegend = (layer) => {
		return (
			<div>
				<FormLabel htmlFor={"legend-" + layer.id}>{layer.text}</FormLabel>
			</div>
		);
	}
	
	render() {
		return (
			<div id="mapFeatures">
				<div className="mapFeatures">
					{this.getLayerActive(this.state.layers[0])}
					{this.getLayerActive(this.state.layers[1])}
				</div>
				<div className="mapFeatures">
					<h4>Tegnforklaring</h4>
					{this.getLayerLegend(this.state.layers[0])}
					{this.getLayerLegend(this.state.layers[1])}
				</div>
			</div>
		);
	}
}

export default MapFeaturesControl;
