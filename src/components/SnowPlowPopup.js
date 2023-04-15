import React from "react";
import {Popup} from "react-map-gl";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

class SnowPlowPopup extends React.Component {
	
	render() {
		return (
			<Popup maxWidth={'280px'} latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
				<h3>Vinterbrøytning av sykkelveier (test)</h3>
				<table style={{ 'border-collapse': 'collapse'}}>
					<tbody>
						<tr>
							<td><HorizontalRuleIcon htmlColor={'#00FF00'} sx={{ transform: 'rotate(-45deg)' }}/></td>
							<td>0-3 timer siden sist brøyting</td>
						</tr>
						<tr>
							<td><HorizontalRuleIcon htmlColor={'#f69a20'} sx={{ transform: 'rotate(-45deg)' }}/></td>
							<td>3 timer eller senere siden sist brøyting</td>
						</tr>
						<tr>
							<td><HorizontalRuleIcon htmlColor={'#fff'} sx={{ transform: 'rotate(-45deg)'}} /></td>
							<td>Det snør. Brøyting pågår. Det prioriteres etter kontrakt med veieier</td>
						</tr>
					</tbody>
				</table>
				<div align={'justify'}>
					Vinterdriftsinformasjon i sykkelkartet er en test i prosjektet: «Smart Drift» i samarbeid mellom Statens vegvesen, Viken fylkeskommune, Drammen kommune og Buskerudbyen i 2023. Har du spørsmål, ta kontakt med post(krøllalfa)buskerudbyen(punktum)no.
				</div>
			</Popup>
		);
	}
	
}

export default SnowPlowPopup;
