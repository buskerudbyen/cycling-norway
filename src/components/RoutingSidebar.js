import React from 'react';
import SearchField from "./SearchField";

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
		return (
			<div id="routing" hidden={this.props.hidden}>
				<div id="searchFields">
					<SearchField onChoose={this.chooseStart} labelText="Fra" />
					<SearchField onChoose={this.chooseDest} labelText="Til" />
				</div>
			</div>
		);
	}
}

export default Menu;
