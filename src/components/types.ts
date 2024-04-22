import { Position, FeatureCollection, Feature, Geometry, LineString, GeoJsonProperties, Point } from "geojson";

export type DayShortName = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

export type Elevation = { elevation: number };

export interface SnowPlowCollection extends FeatureCollection<LineString, SnowPlowProperties>{};

export interface SnowPlowFeature extends Feature<LineString, SnowPlowProperties>{};

export interface MapFeature extends Feature<Point, GeoJsonProperties>{};

type SnowPlowProperties = GeoJsonProperties & {
  isOld?: boolean;
}

export type InfoPopupType =
  | "bikely"
  | "sykkelhotel"
  | "snowplow"
  | "tunnel"
  | "closed_road"
  | "toilet"
  | "bike_route";

export type Network = "international" | "national" | "regional" | "local";

export type OpeningHourTable = {
  [key in DayShortName]: string;
};

export type PopupProperties = GeoJsonProperties & {
  note?: string;
  opening_hours?: string;
  lit?: string;
  conditional_bike?: string;
  fee?: string;
  'name:latin'?: string;
};

export type PopupProps = {
  lngLat: Position;
  onClose: () => void;
  point: PopupProperties;
};

export type PopupPropsForBikeRoute = {
  lngLat: Position;
  onClose: () => void;
  routes: RouteProperties[];
};

export type RouteProperties = GeoJsonProperties & {
  network?: Network;
  from?: string;
  to?: string;
  description?: string;
  website?: string;
};

export type SnowPlow = "snow-plow-snow" | "snow-plow-warn" | "snow-plow-ok";
