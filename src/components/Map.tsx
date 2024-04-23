import React, {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import maplibregl from "maplibre-gl";
import "../styles/map.css";
import "maplibre-gl/dist/maplibre-gl.css";
import Menu from "./menu/Menu";
import MenuWidget from "./menu/MenuWidget";
import Map, {
  GeolocateControl,
  Layer,
  MapRef,
  MapLayerMouseEvent,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre"; // Note: Important to use the MapLibre version of react-map-gl, otherwise we get a lot of incompatible types and weird errors
import { CircularProgress } from "@mui/material";
import polyline from "@mapbox/polyline";
import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
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
} from "./popup/InfoPopup";
import { cities, TARGET_URLS, TARGETS } from "../assets/constants";
import { Coords, Elevation, Feature, InfoPopupType, SnowPlow } from "./types";

const INITIAL_LAT = 59.868;
const INITIAL_LON = 10.322;
const INITIAL_ZOOM = 8;

type Props = {
  isWidget?: boolean;
  dest?: Coords;
  destDescription?: string;
  zoom?: number;
};

const MapContainer = (props: Props) => {
  const lat = window.location.hash
    ? Number(window.location.hash.split("/")[1])
    : props.dest
    ? props.dest.lat
    : INITIAL_LAT;
  const lon = window.location.hash
    ? Number(window.location.hash.split("/")[2])
    : props.dest
    ? props.dest.lng
    : INITIAL_LON;
  const zoom = props.zoom ?? INITIAL_ZOOM;

  const [start, setStart] = useState<Coords | null>(null);
  const [dest, setDest] = useState<Coords | null>(props.dest ?? null);
  const [isBackdropOpen, setIsBackdropOpen] = useState(false);
  // TODO: These three popup states are related and can be combined into one
  //       state object like `const [popup, setPopup] = useState<PopupType|null>(null)`
  const [popupType, setPopupType] = useState<InfoPopupType | null>(null);
  const [popupCoords, setPopupCoords] = useState<Coords | null>(null);
  const [popupPoint, setPopupPoint] = useState<any | null>(null); // TODO: Use a type instead of any
  // TODO: These four route states are related and can be combined into one
  //       state object like `const [trip, setTrip] = useState<TripType|null>(null)`
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeElevation, setRouteElevation] = useState<number | null>(null);
  const [routeElevationProfile, setRouteElevationProfile] = useState<
    number[] | null
  >(null);
  const [simulateLayer, setSimulateLayer] = useState<SnowPlow | null>(null);

  const wrapper = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapRef | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (props.isWidget) {
      if (props.isWidget && url.searchParams.has("from") && dest) {
        const from = parseLngLat(url.searchParams.get("from")!);
        getQuery(from, dest);
      } else if (url.searchParams.has("from")) {
        const from = parseLngLat(url.searchParams.get("from")!);
        updateQueryFromParam(from);
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
          getRandomCityLocation
        );
      } else {
        getRandomCityLocation();
      }
    }
    // TODO: This click listener for the legend should be moved to the legend
    //       itself instead of being on the wrapper for the whole map.
    wrapper.current?.addEventListener("click", (e) => updateQueryByLegend(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (
      window.location.hash !==
      "#" + zoom + "/" + INITIAL_LAT + "/" + INITIAL_LON
    ) {
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
      "top-right"
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

  // Simulate snow plow data
  type SimulationFeature = {
    type: string;
    geometry: {
      type: string;
      coordinates: number[][];
    };
  };
  const drawSimulation = () => {
    let roadOk: SimulationFeature[] = [];
    let roadWarn: SimulationFeature[] = [];
    let roadSnow: SimulationFeature[] = [];
    if (simulateLayer === null) {
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
  const drawOnMap = (
    roadOk: SimulationFeature[],
    roadWarn: SimulationFeature[],
    roadSnow: SimulationFeature[]
  ) => {
    if (map.current !== null) {
      // @ts-expect-error TODO: Are we sure setData works here?
      map.current.getSource("snow-plow-ok")?.setData({
        type: "FeatureCollection",
        features: roadOk,
      });
      // @ts-expect-error TODO: Are we sure setData works here?
      map.current.getSource("snow-plow-warn")?.setData({
        type: "FeatureCollection",
        features: roadWarn,
      });
      // @ts-expect-error TODO: Are we sure setData works here?
      map.current.getSource("snow-plow-snow")?.setData({
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
    setRouteDuration(null);
    setRouteDistance(null);
    setRouteElevation(null);

    const url = new URL(window.location.href);
    url.searchParams.delete("from");
    url.searchParams.delete("to");
    window.history.pushState({}, "", url);

    drawPolyline([]);
  };

  const onStartChoose = (
    event: SyntheticEvent | null,
    value: Feature | string | null
  ) => {
    if (typeof value === "string") {
      console.error("string param not supported yet");
      return;
    }
    if (value !== null && map.current !== null) {
      const coords = new maplibregl.LngLat(
        value.geometry.coordinates[0],
        value.geometry.coordinates[1]
      );
      map.current.setCenter(value.geometry.coordinates);
      updateQueryFromParam(coords);
      if (dest !== null) {
        getQuery(coords, dest);
      }
    } else {
      resetRoute();
    }
  };

  const onDestChoose = (
    event: SyntheticEvent | null,
    value: Feature | string | null
  ) => {
    if (typeof value === "string") {
      console.error("string param not supported yet");
      return;
    }
    if (value !== null && map.current !== null) {
      const coords = new maplibregl.LngLat(
        value.geometry.coordinates[0],
        value.geometry.coordinates[1]
      );
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
    return { lng, lat };
  };

  const lngLatToString = (lngLat: { lat: number; lng: number }) =>
    `${lngLat.lat.toFixed(5)},${lngLat.lng.toFixed(5)}`;

  const onMapClick = (event: MapLayerMouseEvent) => {
    if (map.current !== null) {
      const bikelyFeatures = map.current.queryRenderedFeatures(event.point, {
        layers: ["poi-bikely"],
      });
      const sykkelHotelFeatures = map.current.queryRenderedFeatures(
        event.point,
        {
          layers: ["poi-bicycle-parking-shed"],
        }
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
        }
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
    }
  };

  const onPopupClose = () => {
    setPopupType(null);
    setPopupPoint(null);
  };

  const addMarker = (event: MapLayerMouseEvent) => {
    if (start !== null && dest !== null) {
      return;
    }
    if (start === null && dest !== null) {
      updateQueryFromParam(event.lngLat);
      getQuery(event.lngLat, dest);
    } else if (start === null) {
      updateQueryFromParam(event.lngLat);
    } else {
      getQuery(start, event.lngLat);
    }
  };

  const updateStartCoord = (event: { lngLat: Coords }) => {
    getQuery(event.lngLat, dest);
  };

  const updateDestCoord = (event: { lngLat: Coords }) => {
    getQuery(start, event.lngLat);
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
    // @ts-expect-error TODO: Are we sure setData works here?
    map.current?.getSource("route")?.setData(geojson);

    const coordinates = features.map((f) => f.geometry.coordinates).flat();

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
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
    );

    if (lines.length) {
      map.current?.fitBounds(bounds, {
        padding: 100,
      });
    }
  };

  const updateQueryFromParam = (start: Coords) => {
    const url = new URL(window.location.href);
    url.searchParams.set("from", lngLatToString(start));
    window.history.pushState({}, "", url);
    setStart(start);
  };

  const updateQueryToParam = (dest: Coords) => {
    if (!props.isWidget) {
      const url = new URL(window.location.href);
      url.searchParams.set("to", lngLatToString(dest));
      window.history.pushState({}, "", url);
      setDest(dest);
    }
  };

  const getQuery = (start: Coords | null, dest: Coords | null) => {
    if (start === null || dest === null) {
      return;
    }
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
      // @ts-ignore TODO: Make a type for the response, remember to see if response can contain errors
      .then((response) => {
        const tripPatterns = response.data.trip.tripPatterns;
        if (tripPatterns.length > 0) {
          const tripPattern = response.data.trip.tripPatterns[0];
          const polyline = tripPattern.legs.map(
            (l: any) => l.pointsOnLink.points
          ) as [string];
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
            tripPattern.legs[0].elevationProfile.map(
              (e: Elevation) => e.elevation
            )
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
    updateLegendByQuery();
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
        [...TARGET_URLS.values()].flat().join(",")
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
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const DEST_DESCRIPTION_MIN_LENGTH = 3;
  const DEST_DESCRIPTION_MAX_LENGTH = 140;
  const destPopup = useMemo(() => {
    if (props.destDescription) {
      return new maplibregl.Popup().setText(props.destDescription);
    }
  }, [props.destDescription]);
  const toggleDestPopup = useCallback(() => {
    // If description is too short or too long, do not toggle popup
    if (
      props.destDescription &&
      props.destDescription.length > DEST_DESCRIPTION_MIN_LENGTH &&
      props.destDescription.length < DEST_DESCRIPTION_MAX_LENGTH
    ) {
      destMarkerRef.current?.togglePopup();
    }
  }, [props.destDescription]);

  return (
    <div className={`map-wrap ${props.isWidget ? "widget" : ""}`} ref={wrapper}>
      <Map
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
        {popupType !== null && popupCoords !== null && (
          <InfoPopup
            type={popupType}
            popupCoords={popupCoords}
            onPopupClose={onPopupClose}
            popupPoint={popupPoint}
          />
        )}
        {props.isWidget ? (
          <MenuWidget
            reset={resetRoute}
            chooseStart={onStartChoose}
            duration={routeDuration}
            distance={routeDistance}
            elevation={routeElevation}
            elevationProfile={routeElevationProfile}
          />
        ) : (
          <Menu
            reset={resetRoute}
            chooseStart={onStartChoose}
            chooseDest={onDestChoose}
            duration={routeDuration}
            distance={routeDistance}
            elevation={routeElevation}
            elevationProfile={routeElevationProfile}
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
          <AttributionPanel />
        </div>
        {start && (
          <Marker
            longitude={start?.lng}
            latitude={start?.lat}
            color="white"
            anchor="center"
            draggable
            onDragEnd={updateStartCoord}
          >
            <TripOriginIcon />
          </Marker>
        )}
        {dest && (
          <Marker
            longitude={dest?.lng}
            latitude={dest?.lat}
            anchor="center"
            color="red"
            draggable={!props.isWidget} // Disable dragging in widget mode, destination is fixed
            onDragEnd={updateDestCoord}
            popup={destPopup}
            ref={destMarkerRef}
            onClick={(e) => {
              // If we let the click event propagates to the map, it will
              // immediately close the popup with `closeOnClick: true`
              e.originalEvent.stopPropagation();
              toggleDestPopup();
            }}
          />
        )}
      </Map>
      {isBackdropOpen && (
        <div className="backdrop">
          <CircularProgress color="info" />
        </div>
      )}
    </div>
  );
};

export default MapContainer;
