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

    getNetwork(network) {
        if (network === "international") return "(internasjonal)";
        if (network === "national") return "(nasjonal)";
        if (network === "regional") return "(regional)";
        if (network === "local") return "(lokal)";
        return "";
    }

    getMultipleRoutesPopup() {
        const [hasDetails, noDetails] = this.props.point.reduce((arr, cur) => {
          arr[cur.properties['from'] || cur.properties['to'] || cur.properties['description'] || cur.properties['website'] ? 0 : 1].push(cur);
          return arr;
        }, [ [], [] ]);

        const rowsEnabled = [];
        for (let r of hasDetails) {
            rowsEnabled.push(
                <Button
                    key={r.properties['name']}
                    className="routeChoice"
                    variant="outlined"
                    size="small"
                    onClick={() => this.chooseRoute(r)}>{r.properties['name']}
                </Button>);
        }
        const rowsDisabled = [];
        for (let r of noDetails) {
            rowsDisabled.push(
                <Button
                    key={r.properties['name']}
                    className="routeChoice"
                    variant="outlined"
                    size="small"
                    disabled
                    onClick={() => this.chooseRoute(r)}>{r.properties['name']}
                </Button>);
        }

        return (
            <Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
                <h4>Flere sykkelruter funnet. Vennligst velg:</h4>
                {rowsEnabled}
                {rowsDisabled}
            </Popup>);
    }

    getSingleRoutePopup() {
        const route = this.state.chosenRoute.properties;
        const hasFromTo = route['from'] && route['to'];
        const hasDesc = route['description'];
        const hasWebsite = route['website'];

        return (
            <Popup latitude={this.props.lngLat.lat} longitude={this.props.lngLat.lng} onClose={this.props.onClose}>
                <h3>{route['name']} {this.getNetwork(route['network'])}</h3>
                {hasFromTo && <h4>{route['from']} - {route['to']}</h4>}
                {hasDesc && <div align={'justify'}>{route['description']}</div>}
                {hasWebsite && <div><a href={route['website']} target="_blank">Webside med mer informasjon</a></div>}
            </Popup>);
    }

	render() {
	    return this.state.multiple ? this.getMultipleRoutesPopup() : this.getSingleRoutePopup();
	}

}

export default BikeRoutePopup;
