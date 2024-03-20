import React from "react";
import {Popup} from "react-map-gl";
import {Button} from "@mui/material";

/**
    The props.point can have multiple points (is a list). If there are multiple elements,
    the user has to choose one to see its details.
*/
class BikeRoutePopup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            multiple: props.point.length > 1,
            chosenRoute: props.point.length === 1 ? props.point[0] : null
        }
        this.chooseRoute = this.chooseRoute.bind(this);
    }

    chooseRoute(route) {
        this.setState({
            multiple: false,
            chosenRoute: route
        });
    }

    getMultipleRoutesPopup() {
        const rows = [];
        for (let r of this.props.point) {
            rows.push(
                <Button
                    key={r.properties['name']}
                    className="routeChoice"
                    variant="outlined"
                    size="small"
                    onClick={() => this.chooseRoute(r)}>{r.properties['name']}
                </Button>);
        }

        return (
            <Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
                <h4>Multiple routes found! Choose:</h4>
                {rows}
            </Popup>);
    }

    getSingleRoutePopup() {
        const route = this.state.chosenRoute.properties;
        const hasFromTo = route['from'] && route['to'];
        const hasDesc = route['description'];

        return (
            <Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
                <h3>{route['name']}</h3>
                {hasFromTo && <h4>{route['from']} - {route['to']}</h4>}
                {hasDesc && <div align={'justify'}>{route['description']}</div>}
            </Popup>);
    }

	render() {
	    return this.state.multiple ? this.getMultipleRoutesPopup() : this.getSingleRoutePopup();
	}

}

export default BikeRoutePopup;
