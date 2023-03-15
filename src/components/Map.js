import React from "react";
import maplibregl from "maplibre-gl";
import '../styles/map.css';
import 'maplibre-gl/dist/maplibre-gl.css'
import Menu from './Menu';
import SearchField from "./SearchField";
import Map, {AttributionControl, GeolocateControl, Layer, Marker, NavigationControl, Source} from "react-map-gl";
import {Backdrop, CircularProgress} from "@mui/material";
import polyline from '@mapbox/polyline';
import BikelyPopup from "./BikelyPopup";
import {MaplibreLegendControl} from "@watergis/maplibre-gl-legend";
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import SnowPlowPopup from "./SnowPlowPopup";

const INITIAL_LAT = 59.7390;
const INITIAL_LON = 10.1878;
const INITIAL_ZOOM = 14;

const TARGETS = {
	"bicycle-lane": "Sykkelveier",
	"bicycle-route-national-background": "Nasjonale sykkelruter",
	"bicycle-route-local-background": "Lokale sykkelruter",
	"bicycle-route-national-overlay": "Nasjonale sykkelruter",
	"bicycle-route-local-overlay": "Lokale sykkelruter",
	"poi-bicycle-parking-public": "Sykkelparkering",
	"poi-bicycle-parking-private": "Privat sykkelparkering",
	"poi-bicycle-parking-lockers": "Sykkelskap",
	"poi-bicycle-parking-shed": "Sykkelhotel",
	"poi-bicycle-parking-covered": "Sykkelparkering m/tak",
	"poi-bicycle-repair-station": "Sykkelmekk-stasjon"
};

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
			isBackdropOpen: false,
			isBikelyPopupOpen: false,
			isSnowPlowPopupOpen: false,
			popupCoords: null,
			popupPoint: null
		}
		this.map = React.createRef();
		this.mapOnLoad = this.mapOnLoad.bind(this);
		this.addLegend = this.addLegend.bind(this);
		this.loadSnowPlowData = this.loadSnowPlowData.bind(this);
		this.resetRoute = this.resetRoute.bind(this);
		this.onStartChoose = this.onStartChoose.bind(this);
		this.onDestChoose = this.onDestChoose.bind(this);
		this.onPopupClose = this.onPopupClose.bind(this);
		this.onMapClick = this.onMapClick.bind(this);
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
	
	getAttributionText() {
		return "<p>" +
			"<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a>" +
			"&#32;&#32;&#32;" +
			"<a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; Map data from OpenStreetMap</a>" +
			"</p>";
	}
	
	addLegend() {
		this.map.current.addControl(new MaplibreLegendControl(TARGETS, {
			showDefault: true,
			showCheckbox: true,
			onlyRendered: true,
			title: "Tegnforklaring"
		}), 'top-right');
	}
	
	loadSnowPlowData() {
		const roadOk = [];
		const roadWarn = [];
		if (url.searchParams.has("simulateSnowPlows")) {
			// For when we do not have accurate snow plow data.
			let data = require('../assets/snow-plow-example.json');
			for (let feature of data.features) {
				if (Math.floor(1 + Math.random() * (100 - 1)) % 2 === 0) {
					roadWarn.push(feature);
				} else {
					roadOk.push(feature);
				}
			}
		} else {
			fetch("https://cycling-norway.leonard.io/snow-plow-konnerudgata", {
				"method": "GET"
			}).then(response => response.json())
				.then(jsonResponse => {
					// Separate data into two arrays, depending on the age.
					for (let feature of jsonResponse.features) {
						if (feature.properties.isOld) {
							roadWarn.push(feature);
						} else {
							roadOk.push(feature);
						}
					}
				});
		}
		this.map.current.getSource('snow-plow-ok').setData({
			type: "FeatureCollection",
			features: roadOk
		});
		this.map.current.getSource('snow-plow-warn').setData({
			type: "FeatureCollection",
			features: roadWarn
		});
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
			let coords = new maplibregl.LngLat(value.geometry.coordinates[0], value.geometry.coordinates[1]);
			this.map.current.setCenter(value.geometry.coordinates);
			this.setState({
				hasStart: true,
				start: coords
			});
			if (this.state.hasEnd) {
				this.getQuery(coords, this.state.dest);
			}
		}
	}
	
	onDestChoose(event, value) {
		if (value != null && this.map.current != null) {
			let coords = new maplibregl.LngLat(value.geometry.coordinates[0], value.geometry.coordinates[1]);
			this.setState({
				hasEnd: true,
				dest: coords
			});
			if (this.state.hasStart) {
				this.getQuery(this.state.start, coords);
			}
		}
	}
	
	parseLngLat = (s) => {
		const [lat, lng] = s.split(",").map(n => Number(n));
		return { lng, lat };
	};
	
	lngLatToString = (lngLat) => `${lngLat.lat.toFixed(5)},${lngLat.lng.toFixed(5)}`;
	
	onMapClick(event) {
		const bikelyFeatures = this.map.current.queryRenderedFeatures(event.point, {
			layers: ["poi-bikely"]
		});
		const snowPlowFeatures = this.map.current.queryRenderedFeatures(event.point, {
			layers: ["poi-snow-plow-warn", "poi-snow-plow-ok"]
		});
		if (bikelyFeatures.length > 0) {
			const feature = bikelyFeatures[0].properties;
			this.setState({
				isSnowPlowPopupOpen: false,
				isBikelyPopupOpen: true,
				popupCoords: event.lngLat,
				popupPoint: feature
			});
		} else if (snowPlowFeatures.length > 0) {
			const feature = snowPlowFeatures[0].properties;
			this.setState({
				isSnowPlowPopupOpen: true,
				isBikelyPopupOpen: false,
				popupCoords: event.lngLat,
				popupPoint: feature
			});
		} else {
			this.addMarker(event);
		}
	}
	
	onPopupClose() {
		this.setState({
			isBikelyPopupOpen: false,
			isSnowPlowPopupOpen: false,
			popupPoint: null
		})
	}
	
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
	
	updateStartCoord = (event) => {
		this.setState({
			start: event.lngLat
		});
		this.getQuery(event.lngLat, this.state.dest);
	}
	
	updateDestCoord = (event) => {
		this.setState({
			dest: event.lngLat
		});
		this.getQuery(this.state.start, event.lngLat);
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
		Polygon geometries, which would require wrapping all
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
	
	mapOnLoad() {
		this.addLegend();
		this.loadSnowPlowData();
	}
	
	render() {
		return (
			<div className="map-wrap">
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
					onClick={this.onMapClick}
					onLoad={this.mapOnLoad}
					hash={true}
				>
					<Source type="geojson" id="route"
					        data={{
								"type": "FeatureCollection",
								"features": []
							}}/>
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
						}}/>
					<Source type="geojson" id="snow-plow-ok" data={{
						"type": "FeatureCollection",
						"features": []
						}}/>
					<Layer type="line" id="poi-snow-plow-ok" source="snow-plow-ok"
					       layout={{
						       'line-join': 'round',
						       'line-cap': 'round'
					       }}
					       paint={{
						       'line-color': '#00FF00',
						       'line-width': 5
					       }}/>
					<Source type="geojson" id="snow-plow-warn" data={{
						"type": "FeatureCollection",
						"features": []
					}}/>
					<Layer type="line" id="poi-snow-plow-warn" source="snow-plow-warn"
					       layout={{
						       'line-join': 'round',
						       'line-cap': 'round'
					       }}
					       paint={{
						       'line-color': '#FF0000',
						       'line-width': 5
					       }}/>
					{this.state.isBikelyPopupOpen && (
						<BikelyPopup lngLat={this.state.popupCoords} onClose={this.onPopupClose} point={this.state.popupPoint} />)}
					{this.state.isSnowPlowPopupOpen && (
						<SnowPlowPopup lngLat={this.state.popupCoords} onClose={this.onPopupClose} point={this.state.popupPoint} />)}
					<div id="searchFields" >
						<SearchField onChoose={this.onStartChoose} labelText="Fra" />
						<SearchField onChoose={this.onDestChoose} labelText="Til" />
					</div>
					<Menu reset={this.resetRoute} />
					<Backdrop
						sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
						open={this.state.isBackdropOpen}
					>
						<CircularProgress color="inherit" />
					</Backdrop>
					<GeolocateControl
						position="top-left"
						positionOptions={{enableHighAccuracy: true}}
						trackUserLocation={true}
					/>
					<NavigationControl position="bottom-left" showCompass showZoom />
					<AttributionControl position="bottom-right" compact={false}
					                    customAttribution={this.getAttributionText()} />
					{this.state.hasStart && (
						<Marker
							longitude={this.state.start?.lng}
							latitude={this.state.start?.lat}
							color="blue"
							anchor="center"
							draggable
							onDragEnd={this.updateStartCoord} />)}
					{this.state.hasEnd && (
						<Marker
							longitude={this.state.dest?.lng}
							latitude={this.state.dest?.lat}
							anchor="center"
							draggable
							onDragEnd={this.updateDestCoord} >
							<SportsScoreIcon fontSize="large" />
						</Marker>)}
				</Map>
			</div>
		);
	}
}
