import React from "react";
import type { PopupProps, PopupPropsForBikeRoute } from "../types";
import BikeRoutePopup from "./BikeRoutePopup";
import BikelyPopup from "./BikelyPopup";
import ClosedRoadPopup from "./ClosedRoadPopup";
import SnowPlowPopup from "./SnowPlowPopup";
import SykkelHotelPopup from "./SykkelHotelPopup";
import ToiletPopup from "./ToiletPopup";
import TunnelPopup from "./TunnelPopup";

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

// biome-ignore format: We like it better this way
export default function InfoPopup({popup}: {popup: PopupProps | PopupPropsForBikeRoute}) {
	switch (popup.type) {
		case BIKELY_POPUP: {
			return <BikelyPopup popup={popup} />;
    }
		case SYKKELHOTEL_POPUP: {
			return <SykkelHotelPopup popup={popup} />;
    }
		case SNOWPLOW_POPUP: {
			return <SnowPlowPopup popup={popup} />;
    }
		case TUNNEL_POPUP: {
			return <TunnelPopup popup={popup} />;
    }
		case CLOSED_ROAD_POPUP: {
			return <ClosedRoadPopup popup={popup} />;
    }
		case TOILET_POPUP: {
			return <ToiletPopup popup={popup} />;
    }
    case BIKE_ROUTE_POPUP: {
      return <BikeRoutePopup popup={popup} />;
    }
    default: {
      console.error('unknown popup type');
			return null;
		}
	}
}
