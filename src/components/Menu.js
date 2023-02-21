import React from 'react';
import {Box, Button, Modal, Typography} from "@mui/material";

class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isHelpOpen: false
		};
		this.toggleHelpPopup = this.toggleHelpPopup.bind(this);
		this.closeHelpPopup = this.closeHelpPopup.bind(this);
		this.resetRoute = this.resetRoute.bind(this);
		
		this.style = {
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			width: 400,
			bgcolor: 'background.paper',
			border: '2px solid #000',
			boxShadow: 24,
			p: 4,
		};
	}
	
	resetRoute() {
		this.props.reset();
	}
	
	toggleHelpPopup() {
		this.setState(prevState => ({
			isHelpOpen: !prevState.isHelpOpen,
		}));
	}
	
	closeHelpPopup() {
		this.setState(prevState => ({
			isHelpOpen: !prevState.isHelpOpen,
		}));
	}

	render() {
		return (
			<div className="menu">
				<Button id={"reset"} variant={'contained'} size={'small'} onClick={this.resetRoute}>Reset route</Button>
				<Button id={"show-help"} variant={'contained'} size={'small'} onClick={this.toggleHelpPopup}>Help</Button>
				
				<Modal id={"help"} open={this.state.isHelpOpen} aria-labelledby="modal-modal-title"
				       aria-describedby="modal-modal-description"
				       onClose={this.closeHelpPopup}>
					<Box sx={this.style}>
						<Typography id="modal-modal-title" variant="h6" component="h2">
							Bicycle route planning prototype
						</Typography>
						<Typography id="modal-modal-description" sx={{ mt: 2 }}>
							<p>
								Please click on the map once to select the start of the route and click a second time to select its destination.
							</p>
							<p>
								When the route is displayed you can drag the markers to change the start or destination.
							</p>
							<p>
								<a href="./?from=59.72785%2C10.20643&to=59.75285%2C10.16012">Show example</a>
							</p>
						</Typography>
					</Box>
				</Modal>
			</div>
		);
	}
}

export default Menu;
