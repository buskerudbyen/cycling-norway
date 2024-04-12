import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "../styles/map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import Menu from "./Menu";
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl";
import { Backdrop, CircularProgress } from "@mui/material";
import polyline from "@mapbox/polyline";
import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import AttributionPanel from "./AttributionPanel";
import data from "../assets/snow-plow-example.json";
import InfoPopup, {
  BIKELY_POPUP,
  CLOSED_ROAD_POPUP,
  SNOWPLOW_POPUP,
  SYKKELHOTEL_POPUP,
  TUNNEL_POPUP,
  TOILET_POPUP,
  BIKE_ROUTE_POPUP,
} from "./InfoPopup";
import { cities, TARGET_URLS, TARGETS } from "../assets/constants";

const INITIAL_LAT = 59.868;
const INITIAL_LON = 10.322;
const INITIAL_ZOOM = 8;

const MapContainer = (props) => {
  const [lat, setLat] = useState(
    window.location.hash ? window.location.hash.split("/")[1] : INITIAL_LAT
  );
  const [lon, setLon] = useState(
    window.location.hash ? window.location.hash.split("/")[2] : INITIAL_LON
  );
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [hasStart, setHasStart] = useState(false);
  const [start, setStart] = useState(null);
  const [hasEnd, setHasEnd] = useState(false);
  const [dest, setDest] = useState(null);
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const [popupType, setPopupType] = useState(null);
  const [popupCoords, setPopupCoords] = useState(null);
  const [popupPoint, setPopupPoint] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeElevation, setRouteElevation] = useState(null);
  const [routeElevationProfile, setRouteElevationProfile] = useState(null);
  const [simulateLayer, setSimulateLayer] = useState(null);

  const wrapper = useRef(null);
  const map = useRef();

  useEffect(() => {
    const url = new URL(window.location);
    if (url.searchParams.has("from") && url.searchParams.has("to")) {
      const from = parseLngLat(url.searchParams.get("from"));
      const to = parseLngLat(url.searchParams.get("to"));
      getQuery(from, to);
    } else if (url.searchParams.has("from")) {
      const from = parseLngLat(url.searchParams.get("from"));
      updateQueryFromParam(from);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          getLocation,
          getRandomCityLocation
        );
      } else {
        getRandomCityLocation();
      }
    }

    wrapper.current.addEventListener("click", (e) => updateQueryByLegend(e));
  }, []);

  const getLocation = (position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    map.current.setCenter(new maplibregl.LngLat(longitude, latitude));
    map.current.setZoom(15);
  };

  const getRandomCityLocation = () => {
    // if a location is requested by URL, do not change it
    if (
      window.location.hash !==
      "#" + INITIAL_ZOOM + "/" + INITIAL_LAT + "/" + INITIAL_LON
    ) {
      return;
    }

    setTimeout(() => {
      try {
        const cityNum = cities.features.length;
        let rndIndex = Math.floor(Math.random() * (cityNum - 2));
        let city = cities.features.at(rndIndex);
        const latitude = city.geometry.coordinates[0];
        const longitude = city.geometry.coordinates[1];
        map.current.setCenter(new maplibregl.LngLat(longitude, latitude));
        map.current.setZoom(13);
      } catch (e) {
        console.error(e);
      }
    }, 1200);
  };

  const addLegend = () => {
    map.current.addControl(
      new MaplibreLegendControl(TARGETS, {
        showDefault: true,
        showCheckbox: true,
        onlyRendered: true,
        title: "Tegnforklaring",
      }),
      "top-right"
    );
  };

  const loadSnowPlowData = () => {
    const url = new URL(window.location);

    if (url.searchParams.has("showSnowPlows")) {
      fetch("https://cycling-norway.leonard.io/snow-plow-konnerudgata", {
        method: "GET",
      })
        .then((response) => response.json())
        .then((jsonResponse) => {
          // Separate data into arrays.
          const roadOk = [];
          const roadWarn = [];
          const roadSnow = [];
          for (let feature of jsonResponse.features) {
            if (jsonResponse.isSnowing) {
              roadSnow.push(feature);
            } else if (
              feature.properties.isOld === undefined ||
              feature.properties.isOld
            ) {
              roadWarn.push(feature);
            } else {
              roadOk.push(feature);
            }
          }
          drawOnMap(roadOk, roadWarn, roadSnow);
        });
    } else if (url.searchParams.has("simulateSnowPlows")) {
      // For when we do not have accurate snow plow data.
      window.setInterval(drawSimulation, 10000);
    }
  };

  const drawSimulation = () => {
    let roadOk = [];
    let roadWarn = [];
    let roadSnow = [];
    if (simulateLayer == null) {
      // all white
      roadSnow = data.features;
      setSimulateLayer("snow-plow-snow");
    } else if (simulateLayer === "snow-plow-snow") {
      // all orange
      roadWarn = data.features;
      setSimulateLayer("snow-plow-warn");
    } else if (simulateLayer === "snow-plow-warn") {
      // all green
      roadOk = data.features;
      setSimulateLayer("snow-plow-ok");
    } else {
      // empty all
      setSimulateLayer(null);
    }
    drawOnMap(roadOk, roadWarn, roadSnow);
  };

  const drawOnMap = (roadOk, roadWarn, roadSnow) => {
    map.current.getSource("snow-plow-ok").setData({
      type: "FeatureCollection",
      features: roadOk,
    });
    map.current.getSource("snow-plow-warn").setData({
      type: "FeatureCollection",
      features: roadWarn,
    });
    map.current.getSource("snow-plow-snow").setData({
      type: "FeatureCollection",
      features: roadSnow,
    });
  };

  const resetRoute = () => {
    setHasStart(false);
    setStart(null);
    setHasEnd(false);
    setDest(null);
    setRouteDuration(null);
    setRouteDistance(null);
    setRouteElevation(null);

    const url = new URL(window.location);
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    window.history.pushState({}, "", url);

    drawPolyline([]);
  };

  const onStartChoose = (event, value) => {
    if (value != null && map.current != null) {
      let coords = new maplibregl.LngLat(
        value.geometry.coordinates[0],
        value.geometry.coordinates[1]
      );
      map.current.setCenter(value.geometry.coordinates);
      updateQueryFromParam(coords);
      if (hasEnd) {
        getQuery(coords, dest);
      }
    } else {
      resetRoute();
    }
  };

  const onDestChoose = (event, value) => {
    if (value != null && map.current != null) {
      let coords = new maplibregl.LngLat(
        value.geometry.coordinates[0],
        value.geometry.coordinates[1]
      );
      updateQueryToParam(coords);
      if (hasStart) {
        getQuery(start, coords);
      }
    } else {
      resetRoute();
    }
  };

  const parseLngLat = (s) => {
    const [lat, lng] = s.split(",").map((n) => Number(n));
    return { lng, lat };
  };

  const lngLatToString = (lngLat) =>
    `${lngLat.lat.toFixed(5)},${lngLat.lng.toFixed(5)}`;

  const onMapClick = (event) => {
    const bikelyFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["poi-bikely"],
    });
    const sykkelHotelFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["poi-bicycle-parking-shed"],
    });
    const snowPlowFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: [
        "poi-snow-plow-warn",
        "poi-snow-plow-ok",
        "poi-snow-plow-snow",
        "poi-snow-plow-snow-border",
      ],
    });
    const tunnelFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["tunnel-conditional", "no-snowplowing-winter_road"],
    });
    const closedRoadFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["no-snowplowing-winter_road"],
    });
    const toiletFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: ["poi-toilets"],
    });
    const bikeRouteFeatures = map.current.queryRenderedFeatures(event.point, {
      layers: [
        "bicycle-route-local-overlay",
        "bicycle-route-national-overlay",
        "bicycle-route-local-background",
        "bicycle-route-national-background",
      ],
    });
    if (bikelyFeatures.length > 0) {
      const feature = bikelyFeatures[0].properties;
      setPopupType(BIKELY_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (sykkelHotelFeatures.length > 0) {
      const feature = sykkelHotelFeatures[0].properties;
      setPopupType(SYKKELHOTEL_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (snowPlowFeatures.length > 0) {
      const feature = snowPlowFeatures[0].properties;
      setPopupType(SNOWPLOW_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (tunnelFeatures.length > 0) {
      const feature = tunnelFeatures[0].properties;
      setPopupType(TUNNEL_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (closedRoadFeatures.length > 0) {
      const feature = closedRoadFeatures[0].properties;
      setPopupType(CLOSED_ROAD_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (toiletFeatures.length > 0) {
      const feature = toiletFeatures[0].properties;
      setPopupType(TOILET_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(feature);
    } else if (bikeRouteFeatures.length > 0) {
      setPopupType(BIKE_ROUTE_POPUP);
      setPopupCoords(event.lngLat);
      setPopupPoint(bikeRouteFeatures);
    } else {
      addMarker(event);
    }
  };

  const onPopupClose = () => {
    setPopupType(null);
    setPopupPoint(null);
  };

  const addMarker = (event) => {
    if (hasStart && hasEnd) {
      return;
    }
    if (!hasStart) {
      updateQueryFromParam(event.lngLat);
    } else {
      getQuery(start, event.lngLat);
    }
  };

  const updateStartCoord = (event) => {
    getQuery(event.lngLat, dest);
  };

  const updateDestCoord = (event) => {
    getQuery(start, event.lngLat);
  };

  const drawPolyline = (lines) => {
    const features = lines.map((l) => {
      const geojson = polyline.toGeoJSON(l);
      return {
        type: "Feature",
        properties: {},
        geometry: geojson,
      };
    });

    const geojson = {
      type: "FeatureCollection",
      features,
    };
    map.current.getSource("route").setData(geojson);

    let coordinates = features.map((f) => f.geometry.coordinates).flat();

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
      map.current.fitBounds(bounds, {
        padding: 100,
      });
    }
  };

  const updateQueryFromParam = (start) => {
    const url = new URL(window.location);
    url.searchParams.set("from", lngLatToString(start));
    window.history.pushState({}, "", url);

    setHasStart(true);
    setStart(start);
  };

  const updateQueryToParam = (dest) => {
    const url = new URL(window.location);
    url.searchParams.set("to", lngLatToString(dest));
    window.history.pushState({}, "", url);

    setHasEnd(true);
    setDest(dest);
  };

  const getQuery = (start, dest) => {
    updateQueryFromParam(start);
    updateQueryToParam(dest);
    setIsBackdropOpen(true);
    fetch("https://api.entur.io/journey-planner/v3/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/graphql",
      },
      body: `
					{
					  trip(
					    modes: { directMode: bicycle, accessMode: bicycle, egressMode: bicycle, transportModes: { transportMode: water }},
					    from: {coordinates: {latitude: ${start.lat}, longitude: ${start.lng} }},
					    to: {coordinates: {latitude: ${dest.lat}, longitude: ${dest.lng}}}
					    bicycleOptimisationMethod: triangle
					    triangleFactors: {safety: 0.5, slope: 0.2, time: 0.3}
					    bikeSpeed: 7
					  ) {
					    dateTime
					    fromPlace {
					      name
					    }
					    tripPatterns {
					      duration
					      distance
					      legs {
					        mode
					        pointsOnLink {
					          points
					        }
					        elevationProfile {
					          elevation
					        }
					      }
					    }
					  }
					}`,
    })
      .then((response) => response.json())
      .then((response) => {
        const tripPatterns = response.data.trip.tripPatterns;
        if (tripPatterns.length > 0) {
          const tripPattern = response.data.trip.tripPatterns[0];
          const polyline = tripPattern.legs.map((l) => l.pointsOnLink.points);
          const startElevation =
            tripPattern.legs[0].elevationProfile[0]?.elevation;
          const lastLeg = tripPattern.legs[tripPattern.legs.length - 1];
          const endElevation =
            lastLeg?.elevationProfile[lastLeg?.elevationProfile.length - 1]
              .elevation;
          setIsBackdropOpen(false);
          setRouteDuration(response.data.trip.tripPatterns[0].duration);
          setRouteDistance(response.data.trip.tripPatterns[0].distance);
          setRouteElevation(endElevation - startElevation);
          setRouteElevationProfile(
            tripPattern.legs[0].elevationProfile.map((e) => e.elevation)
          );
          drawPolyline(polyline);
        } else {
          setIsBackdropOpen(false);
          alert(
            "Beklager vi kunne ikke finne en god sykkelrute til deg. Vennligst prøv rute over kortere avstand eller fra/til et mer sentralt sted."
          );
        }
      });
  };

  const mapOnLoad = () => {
    addLegend();
    updateLegendByQuery(map.current);
    loadSnowPlowData();
  };

  const updateLegendByQuery = (map) => {
    const url = new URL(window.location);
    if (url.searchParams.has("layers")) {
      const layerList = url.searchParams.get("layers").split(",");
      TARGET_URLS.forEach((key, value) => {
        if (layerList.includes(value)) {
          map.getLayer(key)?.setLayoutProperty("visibility", "visible");
        } else {
          map.getLayer(key)?.setLayoutProperty("visibility", "none");
        }
      });
    } else {
      url.searchParams.set(
        "layers",
        [...TARGET_URLS.values()].flat().join(",")
      );
      window.history.pushState({}, "", url);
    }
  };

  const updateQueryByLegend = (event) => {
    let target = event.target;

    if (target.type === "checkbox" && TARGET_URLS.has(target.name)) {
      const url = new URL(window.location);
      const layerList = url.searchParams.get("layers")?.split(",");
      const urlTag = TARGET_URLS.get(target.name);

      let layerVisible = isVisible(map.current, target.name);
      let layerWasVisible = layerList.includes(urlTag);
      if (!layerVisible && layerWasVisible) {
        const index = layerList.indexOf(urlTag);
        layerList.splice(index, 1);
      } else if (layerVisible && !layerWasVisible) {
        layerList.push(urlTag);
      }

      url.searchParams.set("layers", layerList.join(","));
      window.history.pushState({}, "", url);
    }
  };

  const isVisible = (map, layer) => {
    return map.getLayoutProperty(layer, "visibility") === "visible";
  };

  return (
    <div className="map-wrap" ref={wrapper}>
      <Map
        id="map"
        ref={map}
        mapLib={maplibregl}
        initialViewState={{
          longitude: lon,
          latitude: lat,
          zoom: zoom,
        }}
        scrollZoom
        interactive
        mapStyle="https://byvekstavtale.leonard.io/tiles/bicycle/v1/style.json"
        onClick={onMapClick}
        onLoad={mapOnLoad}
        hash={true}
        locale={{
          "FullscreenControl.Enter": "Fullskjerm",
          "FullscreenControl.Exit": "Avslutt fullskjerm",
          "GeolocateControl.FindMyLocation": "Finn min posisjon",
          "GeolocateControl.LocationNotAvailable": "Posisjon ikke tilgengelig",
          "NavigationControl.ResetBearing": "Roter nord opp og kartet flatt",
          "NavigationControl.ZoomIn": "Zoom inn",
          "NavigationControl.ZoomOut": "Zoom ut",
          "ScrollZoomBlocker.CtrlMessage": "Bruk Ctrl + rull for zoom",
          "ScrollZoomBlocker.CmdMessage": "Bruk ⌘ + rull for zoom",
          "TouchPanBlocker.Message": "Bruk to fingre for å bevege kartet",
        }}
      >
        <Source
          type="geojson"
          id="route"
          data={{
            type: "FeatureCollection",
            features: [],
          }}
        />
        <Layer
          type="line"
          id="route"
          source="route"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#162da0",
            "line-width": 6,
          }}
        />
        <Source
          type="vector"
          id="bikely"
          url="https://byvekstavtale.leonard.io/tiles/bikely.json"
        />
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
            "text-size": 12,
          }}
          paint={{
            "text-color": "#ffffff",
            "text-halo-blur": 0.5,
            "text-halo-color": "#858484",
            "text-halo-width": 1,
          }}
        />
        <Source
          type="geojson"
          id="snow-plow-warn"
          data={{
            type: "FeatureCollection",
            features: [],
          }}
        />
        <Layer
          type="line"
          id="poi-snow-plow-warn"
          source="snow-plow-warn"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#f69a20",
            "line-width": 5,
          }}
        />
        <Source
          type="geojson"
          id="snow-plow-ok"
          data={{
            type: "FeatureCollection",
            features: [],
          }}
        />
        <Layer
          type="line"
          id="poi-snow-plow-ok"
          source="snow-plow-ok"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#00FF00",
            "line-width": 5,
          }}
        />
        <Source
          type="geojson"
          id="snow-plow-snow"
          data={{
            type: "FeatureCollection",
            features: [],
          }}
        />
        <Layer
          type="line"
          id="poi-snow-plow-snow-border"
          source="snow-plow-snow"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#000",
            "line-width": 0.5,
            "line-gap-width": 5,
            "line-opacity": 0.5,
          }}
        />
        <Layer
          type="line"
          id="poi-snow-plow-snow"
          source="snow-plow-snow"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#FFF",
            "line-width": 5,
          }}
        />
        {popupType != null && (
          <InfoPopup
            type={popupType}
            popupCoords={popupCoords}
            onPopupClose={onPopupClose}
            popupPoint={popupPoint}
          />
        )}
        <Menu
          reset={resetRoute}
          chooseStart={onStartChoose}
          chooseDest={onDestChoose}
          duration={routeDuration}
          distance={routeDistance}
          elevation={routeElevation}
          elevationProfile={routeElevationProfile}
        />
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isBackdropOpen}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <GeolocateControl
          position="top-left"
          positionOptions={{ enableHighAccuracy: true }}
          showAccuracyCircle={true}
          trackUserLocation={false}
        />
        <ScaleControl
          unit="metric"
          position="bottom-left"
          style={{ "padding-left": "20px" }}
        />
        <NavigationControl
          position="bottom-left"
          showCompass
          showZoom
          visualizePitch
        />
        <div className="maplibregl-ctrl-bottom-right mapboxgl-ctrl-bottom-right">
          <AttributionPanel />
        </div>
        {hasStart && (
          <Marker
            longitude={start?.lng}
            latitude={start?.lat}
            color="blue"
            anchor="center"
            draggable
            onDragEnd={updateStartCoord}
          />
        )}
        {hasEnd && (
          <Marker
            longitude={dest?.lng}
            latitude={dest?.lat}
            anchor="center"
            draggable
            onDragEnd={updateDestCoord}
          >
            <SportsScoreIcon fontSize="large" />
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default MapContainer;
