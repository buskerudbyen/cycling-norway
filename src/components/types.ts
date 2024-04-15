export type Coords = {
  lat: number;
  lng: number;
};

export type DayShortName = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

// TODO: Could maybe use a Feature type from a library instead?
export type Feature = {
  type: "feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
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
