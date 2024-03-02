export const TARGETS = {
	"bicycle-lane": "Sykkelveier",
	"bicycle-route-national-background": "Nasjonale sykkelruter",
	"bicycle-route-local-background": "Lokale sykkelruter",
	"bicycle-route-national-overlay": "Nasjonale sykkelruter",
	"bicycle-route-local-overlay": "Lokale sykkelruter",
	"poi-bicycle-parking-public": "Sykkelparkering",
	"poi-bicycle-parking-private": "Privat sykkelparkering",
	"poi-bicycle-parking-lockers": "Sykkelskap",
	"poi-bicycle-parking-shed": "Sykkelhotell",
	"poi-bicycle-parking-covered": "Sykkelparkering m/tak",
	"poi-bicycle-repair-station": "Sykkelmekk-stasjon",
	"poi-snow-plow-ok": "0-3 timer siden sist brøyting",
	"poi-snow-plow-warn": "Brøyting: 3 timer eller senere",
	"poi-snow-plow-snow": "Det snør. Brøyting pågår",
	"poi-bicycle-pump-station": "Sykkelpumpe",
	"poi-bicycle-shop": "Sykkelbutikk",
	"poi-pump-track": "Sykkelbaner",
	"poi-bike-track": "Markastier",
	"poi-bikely": "Bikely parkering"
};

export const TARGET_URLS = {
	"bicycle-lane": "anlegg",
	"bicycle-route-national-background": "rute-nb",
	"bicycle-route-local-background": "rute-lb",
	"bicycle-route-national-overlay": "rute-no",
	"bicycle-route-local-overlay": "rute-lo",
	"poi-bicycle-parking-public": "poffentlig",
	"poi-bicycle-parking-private": "pprivat",
	"poi-bicycle-parking-lockers": "pskap",
	"poi-bicycle-parking-shed": "photell",
	"poi-bicycle-parking-covered": "ptak",
	"poi-bicycle-repair-station": "rep",
	"poi-snow-plow-ok": "brøyting-ok",
	"poi-snow-plow-warn": "brøyting-senere",
	"poi-snow-plow-snow": "snør",
	"poi-bicycle-pump-station": "pumpe",
	"poi-bicycle-shop": "butikk",
	"poi-pump-track": "pumptrack",
	"poi-bike-track": "loype",
	"poi-bikely": "bikely"
}
export const TARGET_URLS =  new Map([
	["bicycle-lane", "anlegg"],
	["bicycle-route-national-background", "rute-nb"],
	["bicycle-route-local-background", "rute-lb"],
	["bicycle-route-national-overlay", "rute-no"],
	["bicycle-route-local-overlay", "rute-lo"],
	["poi-bicycle-parking-public", "poffentlig"],
	["poi-bicycle-parking-private", "pprivat"],
	["poi-bicycle-parking-lockers", "pskap"],
	["poi-bicycle-parking-shed", "photell"],
	["poi-bicycle-parking-covered", "ptak"],
	["poi-bicycle-repair-station", "rep"],
	["poi-snow-plow-ok", "brøyting-ok"],
	["poi-snow-plow-warn", "brøyting-senere"],
	["poi-snow-plow-snow", "snør"],
	["poi-bicycle-pump-station", "pumpe"],
	["poi-bicycle-shop", "butikk"],
	["poi-pump-track", "pumptrack"],
	["poi-bike-track", "loype"],
	["poi-bikely", "bikely"],
]);

export const cities = {
	'type': 'FeatureCollection',
	'features': [
		{
			'type': 'Feature',
			'properties': {
				'name': 'Oslo'
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [59.9270, 10.767]
			}
		},
		{
			'type': 'Feature',
			'properties': {
				'name': 'Bergen'
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [60.3950, 5.3296]
			}
		},
		{
			'type': 'Feature',
			'properties': {
				'name': 'Trondheim'
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [63.4295, 10.4162]
			}
		},
		{
			'type': 'Feature',
			'properties': {
				'name': 'Stavanger'
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [58.9682, 5.7320]
			}
		},
		{
			'type': 'Feature',
			'properties': {
				'name': 'Kristiansand'
			},
			'geometry': {
				'type': 'Point',
				'coordinates': [58.1475, 7.9870]
			}
		},
	]
}
