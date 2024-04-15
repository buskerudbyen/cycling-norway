import React from "react";
import BikelyPopup from "./BikelyPopup";
import SykkelHotelPopup from "./SykkelHotelPopup";
import SnowPlowPopup from "./SnowPlowPopup";
import TunnelPopup from "./TunnelPopup";
import ClosedRoadPopup from "./ClosedRoadPopup";
import ToiletPopup from "./ToiletPopup";
import BikeRoutePopup from "./BikeRoutePopup";
import { Coords, InfoPopupType, Point, Route } from "./types";

export const BIKELY_POPUP = "bikely";
export const SYKKELHOTEL_POPUP = "sykkelhotel";
export const SNOWPLOW_POPUP = "snowplow";
export const TUNNEL_POPUP = "tunnel";
export const CLOSED_ROAD_POPUP = "closed_road";
export const TOILET_POPUP = "toilet";
export const BIKE_ROUTE_POPUP = "bike_route";

export const DAYS = new Map([
  ["mo", "mandag"] as const,
  ["tu", "tirsdag"] as const,
  ["we", "onsdag"] as const,
  ["th", "torsdag"] as const,
  ["fr", "fredag"] as const,
  ["sa", "lørdag"] as const,
  ["su", "søndag"] as const,
]);

type PropsWithPoint = {
  type: Omit<InfoPopupType, "bike_route">;
  popupCoords: Coords;
  onPopupClose: () => void;
  popupPoint: Point;
};

type PropsWithRoutes = {
  type: "bike_route";
  popupCoords: Coords;
  onPopupClose: () => void;
  popupPoint: Route[];
};

// prettier-ignore
export default function InfoPopup({type, popupCoords, onPopupClose, popupPoint}: any) {
  // TODO: Fix type discrimination to ensure that props is correctly identified
  //       as (PropsWithPoint | PropsWithRoutes)
	switch (type) {
		case BIKELY_POPUP: {
			return <BikelyPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
		case SYKKELHOTEL_POPUP: {
			return <SykkelHotelPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
		case SNOWPLOW_POPUP: {
			return <SnowPlowPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
		case TUNNEL_POPUP: {
			return <TunnelPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
		case CLOSED_ROAD_POPUP: {
			return <ClosedRoadPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
		case TOILET_POPUP: {
			return <ToiletPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
    case BIKE_ROUTE_POPUP: {
      return <BikeRoutePopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
    }
    default: {
      console.error('unknown popup type:', type);
			return null;
		}
	}
}
