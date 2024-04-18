// TODO: Use this instead: https://visgl.github.io/react-map-gl/docs/api-reference/types#lnglat
export type Coords = {
  lat: number;
  lng: number;
};

export type DayShortName = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

export type Elevation = { elevation: number };

// TODO: Note: This is just home-made. The type is not compatible with Feature
//       from maplibre-gl, should look into the specification and different type
//       implementations to see what makes the most sense for our use case.
export type Feature = {
  type: "feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties?: {
    id?: string;
    gid?: string;
    layer?: string;
    source?: string;
    source_id?: string;
    name?: string;
    street?: string;
    accuracy?: string;
    country_a?: string;
    county?: string;
    county_gid?: string;
    locality?: string;
    locality_gid?: string;
    borough?: string;
    borough_gid?: string;
    label: string;
    category?: string[];
    tariff_zones?: string[];
  };
};

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
  lngLat: Coords;
  onClose: () => void;
  point: Point;
};

export type PopupPropsForBikeRoute = {
  lngLat: Coords;
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
