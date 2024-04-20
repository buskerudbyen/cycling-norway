import { Position, FeatureCollection, Feature, Geometry, LineString, GeoJsonProperties } from "geojson";

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

export type Point = {
  id: number;
  name: string;
  note?: string;
  opening_hours?: string;
  lit?: string;
  conditional_bike?: string;
  fee?: string;
  "name:latin"?: string;
};

export type PopupProps = {
  lngLat: Position;
  onClose: () => void;
  point: Point;
};

export type PopupPropsForBikeRoute = {
  lngLat: Position;
  onClose: () => void;
  point: Route[]; // TODO: Should be renamed "routes"
};

export type PopupPoint = {
  id: string;
  bicyclePlaces: boolean;
  anyCarPlaces: boolean;
  carPlaces: boolean;
  wheelchairAccessibleCarPlaces: boolean;
  name: string;
  realTimeData: boolean;
  tags: string;
  state: string;
  note: string;
  capacity: '{"bicyclePlaces":10,"carPlaces":null,"wheelchairAccessibleCarPlaces":null}';
  "capacity.bicyclePlaces": 10;
  availability: '{"bicyclePlaces":5,"carPlaces":null,"wheelchairAccessibleCarPlaces":null}';
  "availability.bicyclePlaces": 5;
};

// TODO: Perhaps avoid wrapping in `properties`?
export type Route = {
  properties: {
    name: string;
    network: Network;
    from?: string;
    to?: string;
    description?: string;
    website?: string;
  };
};

export type SnowPlow = "snow-plow-snow" | "snow-plow-warn" | "snow-plow-ok";
