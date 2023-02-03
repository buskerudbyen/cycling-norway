import React from "react";
import maplibregl from "maplibre-gl";
import '../styles/map.css';
import 'mapbox-gl/dist/mapbox-gl.css'
import Menu from './Menu';
import SearchField from "./SearchField";
import MapFeaturesControl from "./MapFeaturesControl";
import Map, {GeolocateControl, Layer, Marker, NavigationControl, Source} from "react-map-gl";
import {Backdrop, CircularProgress} from "@mui/material";
import polyline from '@mapbox/polyline';

const INITIAL_LAT = 59.7390;
const INITIAL_LON = 10.1878;
const INITIAL_ZOOM = 14;

export default class MapContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lat: INITIAL_LAT,
			lon: INITIAL_LON,
			zoom: INITIAL_ZOOM,
			hasStart: false,
			start: null,
			hasEnd: false,
			dest: null,
			isBackdropOpen: false
		}
		this.map = React.createRef();
		this.resetRoute = this.resetRoute.bind(this);
		this.onStartChoose = this.onStartChoose.bind(this);
		this.addMarker = this.addMarker.bind(this);
		this.drawPolyline = this.drawPolyline.bind(this);
		this.getQuery = this.getQuery.bind(this);
	}
	
	componentDidMount() {
		const url = new URL(window.location);
		if (url.searchParams.has("from") && url.searchParams.has("to")) {
			const from = this.parseLngLat(url.searchParams.get("from"));
			const to = this.parseLngLat(url.searchParams.get("to"));
			this.setState({
				hasStart: true,
				start: from,
				hasEnd: true,
				dest: to
			})
			this.getQuery(from, to);
		}
	}
	
	resetRoute() {
		this.setState({
			hasStart: false,
			start: null,
			hasEnd: false,
			dest: null
		});
		
		const url = new URL(window.location);
		url.searchParams.delete('from');
		url.searchParams.delete('to');
		window.history.pushState({}, '', url);
		
		this.drawPolyline([]);
	}
	
	onStartChoose(event, value) {
		if (value != null && this.map.current != null) {
			this.map.current.setCenter(value.geometry.coordinates)
		}
	}
	
	parseLngLat = (s) => {
		const [lat, lng] = s.split(",").map(n => Number(n));
		return { lng, lat };
	};
	
	lngLatToString = (lngLat) => `${lngLat.lat.toFixed(5)},${lngLat.lng.toFixed(5)}`;
	
	addMarker(event) {
		if (this.state.hasStart && this.state.hasEnd) {
			return;
		}
		if (!this.state.hasStart) {
			this.setState({
				hasStart: true,
				start: event.lngLat
			})
		} else {
			this.setState({
				hasEnd: true,
				dest: event.lngLat
			});
			this.getQuery(this.state.start, event.lngLat);
		}
	}
	
	drawPolyline = (lines) => {
		const features = lines.map(l => {
			const geojson = polyline.toGeoJSON(l);
			return {
				'type': 'Feature',
				'properties': {},
				'geometry': geojson
			};
		})
		
		const geojson = {
			type: "FeatureCollection",
			features
		}
		this.map.current.getSource('route').setData(geojson);
		
		let coordinates = features.map(f => f.geometry.coordinates).flat();
		
		/* Pass the first coordinates in the LineString to `lngLatBounds`,
		then wrap each coordinate pair in `extend` to include them
		in the bounds result. A variation of this technique could be
		applied to zooming to the bounds of multiple Points or
		Polygon geomtetries, which would require wrapping all
		the coordinates with the extend method. */
		
		let bounds = coordinates.reduce(function (bounds, coord) {
			return bounds.extend(coord);
		}, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
		
		if (lines.length) {
			this.map.current.fitBounds(bounds, {
				padding: 100
			});
		}
	};
	
	getQuery(start, dest) {
		const url = new URL(window.location);
		url.searchParams.set("from", this.lngLatToString(start))
		url.searchParams.set("to", this.lngLatToString(dest))
		window.history.pushState({}, '', url);
		this.setState({
			isBackdropOpen: true
		})
		fetch("https://api.entur.io/journey-planner/v3/graphql", {
			"method": "POST",
			"headers": {
				"Content-Type": "application/graphql"
			},
			"body": `
					{
					  trip(
					    modes: { directMode: bicycle, accessMode: bicycle, egressMode: bicycle, transportModes: { transportMode: water }},
					    from: {coordinates: {latitude: ${start.lat}, longitude: ${start.lng} }},
					    to: {coordinates: {latitude: ${ dest.lat }, longitude: ${dest.lng }}}
					    bicycleOptimisationMethod: triangle,
					    triangleFactors: {safety: 0.5, slope: 0.4, time: 0.1}
					  ) {
					    dateTime
					    fromPlace {
					      name
					    }
					    tripPatterns {
					      duration
					      legs {
					        mode
					        duration
					        pointsOnLink {
					          points
					        }
					      }
					    }
					  }
					}`
		})
			.then(response => response.json())
			.then(response => {
				this.setState({
					isBackdropOpen: false
				})
				const tripPatterns = response.data.trip.tripPatterns;
				if(tripPatterns.length > 0) {
					const polyline = response.data.trip.tripPatterns[0].legs.map(l => l.pointsOnLink.points);
					this.drawPolyline(polyline);
				} else {
					alert("Sorry, could not find a bicycle route.")
				}
			});
	}
	
	// https://www.lostcreekdesigns.co/writing/a-complete-guide-to-sources-and-layers-in-react-and-mapbox-gl-js/
	render() {
		return (
			<div className="map-wrap">
				<div id="controls">
					<SearchField onChoose={this.onStartChoose} />
					<Menu reset={this.resetRoute} />
					<MapFeaturesControl />
					<Backdrop
						sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
						open={this.state.isBackdropOpen}
					>
						<CircularProgress color="inherit" />
					</Backdrop>
				</div>
				<Map
					id="map"
					ref={this.map}
					mapLib={maplibregl}
					initialViewState={{
						longitude: this.state.lon,
						latitude: this.state.lat,
						zoom: this.state.zoom
					}}
					scrollZoom
					interactive
					mapStyle='https://byvekstavtale.leonard.io/tiles/bicycle/v1/style.json'
					onClick={this.addMarker}
				>
					<Source type="geojson" id="route"
					        data={{
								"type": "FeatureCollection",
								"features": []
							}}
					/>
					<Layer type="line" id="route" source="route"
					       layout={{
						       'line-join': 'round',
						       'line-cap': 'round'
					       }}
					       paint={{
						       'line-color': '#162da0',
						       'line-width': 6
					       }}/>
					<Source type="vector" id="bikely" url="https://byvekstavtale.leonard.io/tiles/bikely.json"/>
					<Layer
						type="symbol"
						id="poi-bikely"
						source="bikely"
						source-layer="bikely"
						minZoom={7}
						layout={{
							"icon-image": "bicycle_parking_lockers_bikely_11",
							"icon-size": 1.2,
							"text-anchor": "top",
							"text-field": "{availability.bicyclePlaces}",
							"text-font": ["Noto Sans Regular"],
							"text-max-width": 9,
							"text-offset": [0.6, -1.1],
							"text-padding": 2,
							"text-size": 12
						}}
						paint={{
							"text-color": "#ffffff",
							"text-halo-blur": 0.5,
							"text-halo-color": "#858484",
							"text-halo-width": 1
						}}
					/>
					<GeolocateControl
						position="top-left"
						positionOptions={{enableHighAccuracy: true}}
						trackUserLocation={true}
					/>
					<NavigationControl position="bottom-left" showCompass showZoom />
					{this.state.hasStart ? (
						<Marker longitude={this.state.start?.lng} latitude={this.state.start?.lat} color="blue" anchor="center" />
						)
						: null }
					{this.state.hasEnd ? (
						<Marker longitude={this.state.dest?.lng} latitude={this.state.dest?.lat} color="red" anchor="center" />
						)
						: null }
				</Map>
			</div>
		);
	}
}
