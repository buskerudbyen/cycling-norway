import React from "react";
import BikelyPopup from "./BikelyPopup";
import SykkelHotelPopup from "./SykkelHotelPopup";
import SnowPlowPopup from "./SnowPlowPopup";
import TunnelPopup from "./TunnelPopup";
import ClosedRoadPopup from "./ClosedRoadPopup";

export const BIKELY_POPUP = "bikely";
export const SYKKELHOTEL_POPUP = "sykkelhotel";
export const SNOWPLOW_POPUP = "snowplow";
export const TUNNEL_POPUP = "tunnel";
export const CLOSED_ROAD_POPUP = "closed_road";
export const TOILET_POPUP = "toilet";

export default function InfoPopup({type, popupCoords, onPopupClose, popupPoint}) {
	switch (type) {
		case BIKELY_POPUP:
			return <BikelyPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
		case SYKKELHOTEL_POPUP:
			return <SykkelHotelPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
		case SNOWPLOW_POPUP:
			return <SnowPlowPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
		case TUNNEL_POPUP:
			return <TunnelPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
		case CLOSED_ROAD_POPUP:
			return <ClosedRoadPopup lngLat={popupCoords} onClose={onPopupClose} point={popupPoint} />;
		case TOILET_POPUP:
			break;
	}
}
