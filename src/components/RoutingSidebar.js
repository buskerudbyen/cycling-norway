import React from 'react';
import SearchField from "./SearchField";
import TimerIcon from '@mui/icons-material/Timer';
import HeightIcon from '@mui/icons-material/Height';
import ExpandIcon from '@mui/icons-material/Expand';
import {Box, Modal} from "@mui/material";
import {Chart as ChartJS, registerables} from "chart.js";
import {Line} from "react-chartjs-2";

class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showElevationPopup: false
		}
		this.chooseStart = this.chooseStart.bind(this);
		this.chooseDest = this.chooseDest.bind(this);
		this.showElevationPopup = this.showElevationPopup.bind(this);
		this.hideElevationPopup = this.hideElevationPopup.bind(this);
		
		ChartJS.register(...registerables);
		
		this.style = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			bgcolor: 'background.paper',
			border: '1px solid #000',
			boxShadow: 24,
			p: 2,
		};
	}
	
	chooseStart(event, value) {
		this.props.chooseStart(event, value);
	}
	
	chooseDest(event, value) {
		this.props.chooseDest(event, value);
	}
	
	showElevationPopup() {
		this.setState({
			showElevationPopup: true
		})
	}
	
	hideElevationPopup() {
		this.setState({
			showElevationPopup: false
		})
	}
	
	render() {
		let duration = new Date(this.props.duration * 1000).toISOString().slice(11, 19);
		let distance = (this.props.distance / 1000).toFixed(2);
		let elevation = 0;
		if (this.props.elevation != null) {
			elevation = this.props.elevation.toFixed(2);
		}
		
		return (
			<>
				<div id="routing" hidden={this.props.hidden}>
					<div id="searchFields">
						<SearchField onChoose={this.chooseStart} labelText="Fra" />
						<SearchField onChoose={this.chooseDest} labelText="Til" />
					</div>
					<div id="routingResults" hidden={!this.props.duration}>
						<TimerIcon htmlColor={"gray"} fontSize={"small"} sx={{'margin-left': '5px'}} /><span style={{'margin': '5px'}}>{duration}</span>
						<HeightIcon htmlColor={"gray"} sx={{ transform: 'rotate(90deg)', 'margin-left': '5px' }} /><span style={{'margin': '5px'}}>{distance} km</span>
						<span className="elevation-details-trigger" style={{'margin-left': '5px'}} onMouseOver={this.showElevationPopup}>
							<ExpandIcon htmlColor={"white"} sx={{'margin-right': '5px'}} />
							{elevation} m
						</span>
					</div>
				</div>
				<Modal id={"elevationInfo"} aria-labelledby="modal-title" open={this.state.showElevationPopup} onClose={this.hideElevationPopup}>
					<Box sx={this.style} className="modal-box">
						<Line
							type="line"
							datasetIdKey='id'
							className="elevation-details-modal"
							data={{
								labels: this.props.elevationProfile,
								datasets: [
									{
										id: 1,
										data: this.props.elevationProfile,
										fill: 'origin',
										borderColor: '#162da0',
										backgroundColor: 'rgba(22,45,160,0.5)'
									}
								],
							}}
							options={{
								events: [],
								plugins: {
									legend: {
										display: false,
									},
									subtitle: {
										display: true,
										text: 'Høydeprofil (meter)'
									}
								},
								scales: {
									x: {
										display: false
									}
								},
								pointStyle: false
							}}
						/>
					</Box>
				</Modal>
			</>
		);
	}
}

export default Menu;
