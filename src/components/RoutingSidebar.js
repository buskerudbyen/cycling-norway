import React from 'react';
import SearchField from "./SearchField";
import TimerIcon from '@mui/icons-material/Timer';
import HeightIcon from '@mui/icons-material/Height';

class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.chooseStart = this.chooseStart.bind(this);
		this.chooseDest = this.chooseDest.bind(this);
	}
	
	chooseStart(event, value) {
		this.props.chooseStart(event, value);
	}
	
	chooseDest(event, value) {
		this.props.chooseDest(event, value);
	}
	
	render() {
		let duration = new Date(this.props.duration * 1000).toISOString().slice(11, 19);
		let distance = (this.props.distance / 1000).toFixed(2);
		
		return (
			<div id="routing" hidden={this.props.hidden}>
				<div id="searchFields">
					<SearchField onChoose={this.chooseStart} labelText="Fra" />
					<SearchField onChoose={this.chooseDest} labelText="Til" />
				</div>
				<div id="routingResults" hidden={!this.props.duration}>
					<TimerIcon htmlColor={"gray"} fontSize={"small"} /><span>{duration}</span>
					<HeightIcon htmlColor={"gray"} sx={{ transform: 'rotate(90deg)' }} /><span>{distance} km</span>
				</div>
			</div>
		);
	}
}

export default Menu;
