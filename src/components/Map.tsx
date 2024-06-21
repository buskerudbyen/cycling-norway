import polyline from "@mapbox/polyline";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import { CircularProgress } from "@mui/material";
import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import React, {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMap, {
  GeolocateControl,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre"; // Note: Important to use the MapLibre version of react-map-gl, otherwise we get a lot of incompatible types and weird errors
import { TARGETS, TARGET_URLS, cities } from "../assets/constants";
import data from "../assets/snow-plow-example.json";
import "../styles/map.css";
import AttributionPanel from "./AttributionPanel";
import Menu from "./menu/Menu";
import MenuWidget from "./menu/MenuWidget";
import InfoPopup, {
  BIKELY_POPUP,
  CLOSED_ROAD_POPUP,
  SNOWPLOW_POPUP,
  SYKKELHOTEL_POPUP,
  TUNNEL_POPUP,
  TOILET_POPUP,
  BIKE_ROUTE_POPUP,
} from "./popup/InfoPopup";
import type { Elevation, SnowPlow, SnowPlowCollection, SnowPlowFeature, MapFeature, Trip, PopupProps, PopupPropsForBikeRoute } from "./types";
import type { GeoJSONSource } from "maplibre-gl";
import type { GeoJSON, Position } from "geojson";

const INITIAL_LAT = 59.868;
const INITIAL_LON = 10.322;
const INITIAL_ZOOM = 8;

type Props = {
  isWidget?: boolean;
  dest?: Position;
  destDescription?: string;
  zoom?: number;
};

const MapContainer = (props: Props) => {
  const lat = window.location.hash
    ? Number(window.location.hash.split("/")[1])
    : props.dest
      ? props.dest[1]
      : INITIAL_LAT;
  const lon = window.location.hash
    ? Number(window.location.hash.split("/")[2])
    : props.dest
      ? props.dest[0]
      : INITIAL_LON;
  const zoom = props.zoom ?? INITIAL_ZOOM;

  const [start, setStart] = useState<Position | null>(null);
  const [dest, setDest] = useState<Position | null>(props.dest ?? null);
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  const [popup, setPopup] = useState<PopupProps | PopupPropsForBikeRoute | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [simulateLayer, setSimulateLayer] = useState<SnowPlow | null>(null);

  const wrapper = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapRef | null>(null);

  // biome-ignore lint: Dependency array tested to work well
  useEffect(() => {
    const url = new URL(window.location.href);
    if (props.isWidget) {
      if (url.searchParams.has("from") && dest) {
        const from = parseLngLat(url.searchParams.get("from")!);
        getQuery(from, dest);
      }
    } else {
      if (url.searchParams.has("from") && url.searchParams.has("to")) {
        const from = parseLngLat(url.searchParams.get("from")!);
        const to = parseLngLat(url.searchParams.get("to")!);
        getQuery(from, to);
      } else if (url.searchParams.has("from")) {
        const from = parseLngLat(url.searchParams.get("from")!);
        updateQueryFromParam(from);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          getLocation,
          getRandomCityLocation,
        );
      } else {
        getRandomCityLocation();
      }
    }
    // TODO: This click listener for the legend should be moved to the legend
    //       itself instead of being on the wrapper for the whole map.
    if (!props.isWidget) {
      wrapper.current?.addEventListener("click", (e) => updateQueryByLegend(e));
    }
  }, []);

  const getLocation = (position: {
    coords: { latitude: number; longitude: number };
  }) => {
    const { latitude, longitude } = position.coords;
    map.current?.setCenter(new maplibregl.LngLat(longitude, latitude));
    map.current?.setZoom(15);
  };

  const getRandomCityLocation = () => {
    // if a location is requested by URL, do not change it
    if (window.location.hash !== `#${zoom}/${INITIAL_LAT}/${INITIAL_LON}`) {
      return;
    }
    setTimeout(() => {
      try {
        const cityNum = cities.features.length;
        const rndIndex = Math.floor(Math.random() * (cityNum - 2));
        const city = cities.features.at(rndIndex);
        if (city !== undefined) {
          const latitude = city.geometry.coordinates[0];
          const longitude = city.geometry.coordinates[1];
          map.current?.setCenter(new maplibregl.LngLat(longitude, latitude));
          map.current?.setZoom(13);
        } else {
          console.warn("City not found");
        }
      } catch (e) {
        console.error(e);
      }
    }, 1200);
  };

  const addLegend = () => {
    map.current?.addControl(
      new MaplibreLegendControl(TARGETS, {
        showDefault: true,
        showCheckbox: true,
        reverseOrder: false,
        onlyRendered: true,
        title: "Tegnforklaring",
      }),
      "top-right",
    );
  };

  const loadSnowPlowData = () => {
    const url = new URL(window.location.href);

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
          for (const feature of jsonResponse.features) {
            if (jsonResponse.isSnowing) {
              roadSnow.push(feature as SnowPlowFeature);
            } else if (
              feature.properties.isOld === undefined ||
              feature.properties.isOld
            ) {
              roadWarn.push(feature as SnowPlowFeature);
            } else {
              roadOk.push(feature as SnowPlowFeature);
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
    let roadOk: SnowPlowFeature[] = [];
    let roadWarn: SnowPlowFeature[] = [];
    let roadSnow: SnowPlowFeature[] = [];
    const dataCollection = data as SnowPlowCollection;
    if (simulateLayer === null) {
      // all white
      roadSnow = dataCollection.features;
      setSimulateLayer("snow-plow-snow");
    } else if (simulateLayer === "snow-plow-snow") {
      // all orange
      roadWarn = dataCollection.features;
      setSimulateLayer("snow-plow-warn");
    } else if (simulateLayer === "snow-plow-warn") {
      // all green
      roadOk = dataCollection.features;
      setSimulateLayer("snow-plow-ok");
    } else {
      // empty all
      setSimulateLayer(null);
    }
    drawOnMap(roadOk, roadWarn, roadSnow);
  };

  const drawOnMap = (
    roadOk: SnowPlowFeature[],
    roadWarn: SnowPlowFeature[],
    roadSnow: SnowPlowFeature[],
  ) => {
    if (map.current !== null) {
      const okRoadSource = map.current.getSource("snow-plow-ok") as GeoJSONSource;
      okRoadSource.setData({
        type: "FeatureCollection",
        features: roadOk,
      });
      const warnRoadSource = map.current.getSource("snow-plow-warn") as GeoJSONSource;
      warnRoadSource.setData({
        type: "FeatureCollection",
        features: roadWarn,
      });
      const snowyRoadSource = map.current.getSource("snow-plow-snow") as GeoJSONSource;
      snowyRoadSource.setData({
        type: "FeatureCollection",
        features: roadSnow,
      });
    }
  };

  const resetRoute = () => {
    setStart(null);
    if (!props.isWidget) {
      setDest(null);
    }
    setTrip(null);

    const url = new URL(window.location.href);
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    window.history.pushState({}, "", url);

    drawPolyline([]);
  };

  const onStartChoose = (
    event: SyntheticEvent | null,
    value: MapFeature | string | null,
  ) => {
    if (typeof value === "string") {
      console.error("string param not supported yet");
      return;
    }
    if (value !== null && map.current !== null) {
      const coords = new maplibregl.LngLat(
        value.geometry.coordinates[0],
        value.geometry.coordinates[1],
      );
      map.current.setCenter(coords);
      updateQueryFromParam(value.geometry.coordinates);
      if (dest !== null) {
        getQuery(value.geometry.coordinates, dest);
      }
    } else {
      resetRoute();
    }
  };

  const onDestChoose = (
    event: SyntheticEvent | null,
    value: MapFeature | string | null,
  ) => {
    if (typeof value === "string") {
      console.error("string param not supported yet");
      return;
    }
    if (value !== null && map.current !== null) {
      const coords = [
        value.geometry.coordinates[0],
        value.geometry.coordinates[1],
      ] as Position;
      updateQueryToParam(coords);
      if (start !== null) {
        getQuery(start, coords);
      }
    } else {
      resetRoute();
    }
  };

  const parseLngLat = (s: string) => {
    const [lat, lng] = s.split(",").map((n) => Number(n));
    return [ lng, lat ] as Position;
  };

  const lngLatToString = (lngLat: Position) =>
    `${lngLat[1].toFixed(5)},${lngLat[0].toFixed(5)}`;

  const onMapClick = (event: MapLayerMouseEvent) => {
    if (map.current !== null) {
      const bikelyFeatures = map.current.queryRenderedFeatures(event.point, {
        layers: ["poi-bikely"],
      });
      const sykkelHotelFeatures = map.current.queryRenderedFeatures(
        event.point,
        {
          layers: ["poi-bicycle-parking-shed"],
        },
      );
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
      const closedRoadFeatures = map.current.queryRenderedFeatures(
        event.point,
        {
          layers: ["no-snowplowing-winter_road"],
        },
      );
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
        setPopup({
          type: BIKELY_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: bikelyFeatures[0].properties
        });
      } else if (sykkelHotelFeatures.length > 0) {
        setPopup({
          type: SYKKELHOTEL_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: sykkelHotelFeatures[0].properties
        });
      } else if (snowPlowFeatures.length > 0) {
        setPopup({
          type: SNOWPLOW_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: snowPlowFeatures[0].properties
        });
      } else if (tunnelFeatures.length > 0) {
        setPopup({
          type: TUNNEL_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: tunnelFeatures[0].properties
        });
      } else if (closedRoadFeatures.length > 0) {
        setPopup({
          type: CLOSED_ROAD_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: closedRoadFeatures[0].properties
        });
      } else if (toiletFeatures.length > 0) {
        setPopup({
          type: TOILET_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          point: toiletFeatures[0].properties
        });
      } else if (bikeRouteFeatures.length > 0) {
        setPopup({
          type: BIKE_ROUTE_POPUP,
          onClose: onPopupClose,
          lngLat: [event.lngLat.lng, event.lngLat.lat],
          routes: bikeRouteFeatures.map(e => e.properties)
        });
      } else {
        addMarker([event.lngLat.lng, event.lngLat.lat]);
      }
    }
  };

  const onPopupClose = () => {
    setPopup(null);
  };

  const addMarker = (lngLat: Position) => {
    if (start !== null && dest !== null) {
      return;
    }
    if (start === null && dest !== null) {
      updateQueryFromParam(lngLat);
      getQuery(lngLat, dest);
    } else if (start === null) {
      updateQueryFromParam(lngLat);
    } else {
      getQuery(start, lngLat);
    }
  };

  const updateStartCoord = (lngLat: Position) => {
    getQuery(lngLat, dest);
  };

  const updateDestCoord = (lngLat: Position) => {
    getQuery(start, lngLat);
  };

  const drawPolyline = (lines: string[]) => {
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

    const routeSource = map.current?.getSource("route") as GeoJSONSource;
    routeSource.setData(geojson as GeoJSON);

    const coordinates = features.flatMap((f) => f.geometry.coordinates);

    /* Pass the first coordinates in the LineString to `lngLatBounds`,
		then wrap each coordinate pair in `extend` to include them
		in the bounds result. A variation of this technique could be
		applied to zooming to the bounds of multiple Points or
		Polygon geometries, which would require wrapping all
		the coordinates with the extend method. */

    const bounds = coordinates.reduce(
      // @ts-expect-error TODO: Figure out these types
      (bounds, coord) => bounds.extend(coord),
      // @ts-expect-error TODO: Figure out these types
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    );

    if (lines.length) {
      map.current?.fitBounds(bounds, {
        padding: 100,
      });
    }
  };

  const updateQueryFromParam = (start: Position) => {
    if (!props.isWidget) {
      const url = new URL(window.location.href);
      url.searchParams.set("from", lngLatToString(start));
      window.history.pushState({}, "", url);
    }
    setStart(start);
  };

  const updateQueryToParam = (dest: Position) => {
    if (!props.isWidget) {
      const url = new URL(window.location.href);
      url.searchParams.set("to", lngLatToString(dest));
      window.history.pushState({}, "", url);
    }
    setDest(dest);
  };

  const getQuery = (start: Position | null, dest: Position | null) => {
    if (start === null || dest === null) {
      return;
    }
    if (!props.isWidget) {
      updateQueryFromParam(start);
      updateQueryToParam(dest);
    }
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
					    from: {coordinates: {latitude: ${start[1]}, longitude: ${start[0]} }},
					    to: {coordinates: {latitude: ${dest[1]}, longitude: ${dest[0]}}}
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
      // @ts-ignore TODO: Make a type for the response, remember to see if response can contain errors
      .then((response) => {
        const tripPatterns = response.data.trip.tripPatterns;
        if (tripPatterns.length > 0) {
          const tripPattern = response.data.trip.tripPatterns[0];
          const polyline = tripPattern.legs.map(
            (l: any) => l.pointsOnLink.points,
          ) as [string];
          const elevationProfile: number[] = tripPattern.legs[0].elevationProfile.map((e: Elevation) => e.elevation);
          setTrip({
            duration: response.data.trip.tripPatterns[0].duration,
            distance: response.data.trip.tripPatterns[0].distance,
            elevation: getElevationSum(elevationProfile),
            elevationProfile
          });
          setIsBackdropOpen(false);
          drawPolyline(polyline);
        } else {
          setIsBackdropOpen(false);
          alert(
            "Beklager vi kunne ikke finne en god sykkelrute til deg. Vennligst prøv rute over kortere avstand eller fra/til et mer sentralt sted.",
          );
        }
      });
  };

  const getElevationSum = (elevationProfile: number[]): number => {
    let sum = 0;
    for (let i = 0; i <= elevationProfile.length; i++) {
      if(i !== 0 && elevationProfile[i] > elevationProfile[i-1]) {
        sum += elevationProfile[i] - elevationProfile[i-1];
      }
    }
    return sum;
  }

  const mapOnLoad = () => {
    addLegend();
    if (!props.isWidget) {
      updateLegendByQuery();
    }
    loadSnowPlowData();
  };

  const updateLegendByQuery = () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("layers")) {
      const layerList = url.searchParams.get("layers")!.split(",");
      TARGET_URLS.forEach((key, value) => {
        if (layerList.includes(value)) {
          map.current
            ?.getLayer(key)
            ?.setLayoutProperty("visibility", "visible");
        } else {
          map.current?.getLayer(key)?.setLayoutProperty("visibility", "none");
        }
      });
    } else {
      url.searchParams.set(
        "layers",
        [...TARGET_URLS.values()].flat().join(","),
      );
      window.history.pushState({}, "", url);
    }
  };

  const updateQueryByLegend = (event: MouseEvent) => {
    const target = event.target as HTMLInputElement;

    if (target.type === "checkbox" && TARGET_URLS.has(target.name)) {
      const url = new URL(window.location.href);
      const layerList: string[] =
        url.searchParams.get("layers")?.split(",") ?? [];
      const urlTag = TARGET_URLS.get(target.name);

      const layerVisible = isVisible(map.current, target.name);
      if (urlTag !== undefined) {
        const layerWasVisible = layerList.includes(urlTag);
        if (!layerVisible && layerWasVisible) {
          const index = layerList.indexOf(urlTag);
          layerList.splice(index, 1);
        } else if (layerVisible && !layerWasVisible) {
          layerList.push(urlTag);
        }
      }

      url.searchParams.set("layers", layerList.join(","));
      window.history.pushState({}, "", url);
    }
  };

  const isVisible = (map: MapRef | null, layer: string) => {
    return map?.getLayoutProperty(layer, "visibility") === "visible";
  };

  // The destination marker can show a popup when clicked
  const [destMarkerRef, setDestMarkerRef] = useState<maplibregl.Marker | null>(
    null,
  );
  const DEST_DESCRIPTION_MIN_LENGTH = 3;
  const DEST_DESCRIPTION_MAX_LENGTH = 140;
  const destPopup = useMemo(() => {
    if (props.destDescription) {
      return new maplibregl.Popup().setText(props.destDescription);
      // .setOffset([0, 20]); // If we want to show the popup overlaid on the marker, do something like this
    }
  }, [props.destDescription]);
  const toggleDestPopup = useCallback(() => {
    // If description is too short or too long, do not toggle popup
    if (
      props.destDescription &&
      props.destDescription.length > DEST_DESCRIPTION_MIN_LENGTH &&
      props.destDescription.length < DEST_DESCRIPTION_MAX_LENGTH
    ) {
      destMarkerRef?.togglePopup();
    }
  }, [props.destDescription, destMarkerRef]);
  // Show destination popup when the widget loads
  useEffect(() => {
    toggleDestPopup();
  }, [toggleDestPopup]);

  return (
    <div className={`map-wrap ${props.isWidget ? "widget" : ""}`} ref={wrapper}>
      <ReactMap
        id="map"
        ref={map}
        mapLib={maplibregl}
        initialViewState={{
          longitude: lon,
          latitude: lat,
          zoom,
        }}
        scrollZoom
        interactive
        mapStyle="https://byvekstavtale.leonard.io/tiles/bicycle/v1/style.json"
        onClick={onMapClick}
        onLoad={mapOnLoad}
        hash={!props.isWidget}
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
          minzoom={7}
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
        {popup !== null && (
          <InfoPopup popup={popup} />
        )}
        {props.isWidget ? (
          <MenuWidget
            chooseStart={onStartChoose}
            reset={resetRoute}
            start={start}
            dest={dest}
            trip={trip}
          />
        ) : (
          <Menu
            chooseStart={onStartChoose}
            chooseDest={onDestChoose}
            reset={resetRoute}
            start={start}
            dest={dest}
            trip={trip}
          />
        )}
        <GeolocateControl
          position="top-left"
          positionOptions={{ enableHighAccuracy: true }}
          showAccuracyCircle={true}
          trackUserLocation={false}
        />
        <ScaleControl
          unit="metric"
          position="bottom-left"
          style={{ paddingLeft: "20px" }}
        />
        <NavigationControl
          position="bottom-left"
          showCompass
          showZoom
          visualizePitch
        />
        <div className="maplibregl-ctrl-bottom-right">
          <AttributionPanel
            dest={props.dest}
            isWidget={props.isWidget}
            mapRef={map}
          />
        </div>
        {start && (
          <Marker
            longitude={start[0]}
            latitude={start[1]}
            color="white"
            anchor="center"
            draggable
            onDragEnd={(e) => updateStartCoord([e.lngLat.lng, e.lngLat.lat])}
          >
            <TripOriginIcon />
          </Marker>
        )}
        {dest && (
          <Marker
            longitude={dest[0]}
            latitude={dest[1]}
            anchor="center"
            color="red"
            draggable={!props.isWidget} // Disable dragging in widget mode, destination is fixed
            onDragEnd={(e) => updateDestCoord([e.lngLat.lng, e.lngLat.lat])}
            popup={destPopup}
            ref={setDestMarkerRef}
            onClick={(e) => {
              // If we let the click event propagates to the map, it will
              // immediately close the popup with `closeOnClick: true`
              e.originalEvent.stopPropagation();
              toggleDestPopup();
            }}
          />
        )}
      </ReactMap>
      {isBackdropOpen && (
        <div className="backdrop">
          <CircularProgress color="info" />
        </div>
      )}
    </div>
  );
};

export default MapContainer;
