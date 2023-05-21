import React from "react";
import {Popup} from "react-map-gl";

class BikeParkPopup extends React.Component {
	
	render() {
		return (
			<Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<h3>{this.props.point['name:latin']}</h3>
				<div align={'justify'}>Parkeringsløsningen i et bygg og bak låste dører er tilgjengelig for alle som betaler abonnement, også de som ikke reiser med tog. Bruk appen <a href="https://www.banenor.no/Jernbanen/Sykle-til-stasjonen-/" >Bane NOR Parkering for registering, abonnement og å åpne porten</a>. Tilgangen koster 50 kroner og varer i 30 dager. Sykkelhotellene driftes av Bane NOR.</div>
			</Popup>
		);
	}
	
}

export default BikeParkPopup;
