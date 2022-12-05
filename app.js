import GeocoderControl from "./js/GeocoderControl.js";
import MapFeaturesControl from "./js/MapFeaturesControl.js";

const center = [10.1878, 59.7390];
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://byvekstavtale.leonard.io/tiles/bicycle/v1/style.json',
  center: center,
  zoom: 14,
  hash: true
});

map.addControl(new MapFeaturesControl(), "top-right");
map.addControl(new GeocoderControl(), "top-left");
map.addControl(new maplibregl.NavigationControl(), "bottom-left");

let startMarker, destMarker = null;

const showHelp = () => {
  const help = document.getElementById("help").cloneNode(true);
  const popup = new maplibregl.Popup({className: 'my-class'})
    .setLngLat(map.getCenter())
    .setDOMContent(help)
    .setMaxWidth("300px")
    .addTo(map);
}

const help = document.getElementById("show-help");
help.onclick = () => {
  showHelp();
}

const reset = () => {
  startMarker.remove();
  startMarker = null;
  destMarker.remove();
  destMarker = null;
  drawPolyline([]);

  const url = new URL(window.location);

  url.searchParams.delete('from');
  url.searchParams.delete('to');
  window.history.pushState({}, '', url);

}

const res = document.getElementById("reset");
res.onclick = () => {
  reset();
}

const parseLatLng = (s) => {
  const [lat, lng] = s.split(",").map(n => Number(n));
  return { lat, lng };
};

map.on('load', () => {
  map.addSource('route', {
    'type': 'geojson',
    'data': {
      "type": "FeatureCollection",
      "features": []
    }
  });


  map.addLayer({
    'id': 'route',
    'type': 'line',
    'source': 'route',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#162da0',
      'line-width': 6
    }
  });

  if(!localStorage.getItem("helpShown")) {
    showHelp();
    localStorage.setItem('helpShown', true);
  }

  const targets = {
    "bicycle-lane": "Sykkelveier",
    "bicycle-route-national-background": "Nasjonale sykkelruter",
    "bicycle-route-local-background": "Lokale sykkelruter",
    "bicycle-route-national-overlay": "Nasjonale sykkelruter",
    "bicycle-route-local-overlay": "Lokale sykkelruter",
    "poi-bicycle-parking-public": "Offentlig sykkelparkering",
    "poi-bicycle-parking-private": "Privat sykkelparkering",
    "poi-bicycle-parking-lockers": "Sykkelskap",
    "poi-bicycle-parking-shed": "Sykkelhotel",
    "poi-bicycle-parking-covered": "Overbygd sykkelparkering",
    "poi-bicycle-repair-station": "Sykkelreparasjonsstasjon"
  };

  map.addControl(new watergis.MaplibreLegendControl(targets, {
        showDefault: true,
        showCheckbox: false,
        onlyRendered: true,
        title: "Tegnforklaring"
  }), 'top-right');

  map.addSource('bikely', {
    type: 'vector',
    url: "https://byvekstavtale.leonard.io/tiles/bikely.json"
  });

  map.addLayer({
    "id": "poi-bikely",
    "type": "symbol",
    "source": "bikely",
    "source-layer": "bikely",
    "minzoom": 7,
    "layout": {
      "icon-image": "bicycle_parking_lockers_bikely_11",
      "icon-size": 1.2,
      "text-anchor": "top",
      "text-field": "{availability.bicyclePlaces}",
      "text-font": ["Noto Sans Regular"],
      "text-max-width": 9,
      "text-offset": [0.6, -1.1],
      "text-padding": 2,
      "text-size": 12
    },
    "paint": {
      "text-color": "#ffffff",
      "text-halo-blur": 0.5,
      "text-halo-color": "#858484",
      "text-halo-width": 1
    }
  });

  // Create a popup, but don't add it to the map yet.
  var popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('click', 'poi-bikely', function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.coordinates.slice();

    const p = e.features[0].properties;


    const html = `
      <h3>${p.name} (${p.id})</h3>
      <div>${p.note}</div>
    `;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(coordinates).setHTML(html).addTo(map);
  });

  const url = new URLSearchParams(window.location.search);
  if(url.has("from") && url.has("to")) {
    const from = parseLatLng(url.get("from"));
    const to = parseLatLng(url.get("to"));
    [ makeStartMarker(from), makeDestMarker(to)].map(m => m.addTo(map));
    queryAndRender(from, to);
  }
});

const drawPolyline = (lines) => {

  const features = lines.map(l => {
    const geojson = polyline.toGeoJSON(l);

    return {
      'type': 'Feature',
      'properties': {},
      'geometry': geojson
    };
  })


  const geojson = {
    type: "FeatureCollection",
    features
  }

  map.getSource('route').setData(geojson);

  var coordinates = features.map(f => f.geometry.coordinates).flat();

  /*
Pass the first coordinates in the LineString to `lngLatBounds`,
then wrap each coordinate pair in `extend` to include them
in the bounds result. A variation of this technique could be
applied to zooming to the bounds of multiple Points or
Polygon geomtetries, which would require wrapping all
the coordinates with the extend method.
*/

  var bounds = coordinates.reduce(function (bounds, coord) {
    return bounds.extend(coord);
  }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

  if(lines.length) {
    map.fitBounds(bounds, {
      padding: 100
    });
  }
};

const showThrobber = () => {
  const e = document.getElementById("throbber");
  e.classList.remove("hidden");
}

const hideThrobber = () => {
  const e = document.getElementById("throbber");
  e.classList.add("hidden");
}

const latLngToString = ({ lat, lng} ) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

const queryAndRender = (start, dest) => {

  const url = new URL(window.location);

  url.searchParams.set('from', latLngToString(start));
  url.searchParams.set('to', latLngToString(dest));
  window.history.pushState({}, '', url);

  showThrobber();

  fetch("https://api.entur.io/journey-planner/v3/graphql", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/graphql"
    },
    "body": `
{
  trip(
    modes: { directMode: bicycle, accessMode: bicycle, egressMode: bicycle, transportModes: { transportMode: water }},
    from: {coordinates: {latitude: ${start.lat}, longitude: ${start.lng} }},
    to: {coordinates: {latitude: ${ dest.lat }, longitude: ${dest.lng }}}
    bicycleOptimisationMethod: triangle,
    triangleFactors: {safety: 0.5, slope: 0.4, time: 0.1}
  ) {
    dateTime
    fromPlace {
      name
    }
    tripPatterns {
      duration
      legs {
        mode
        duration
        pointsOnLink {
          points
        }
      }
    }
  }
}
`
  })
    .then(response => response.json())
    .then(response => {

      hideThrobber();
      const tripPatterns = response.data.trip.tripPatterns;
      if(tripPatterns.length > 0) {
        const polyline = response.data.trip.tripPatterns[0].legs.map(l => l.pointsOnLink.points);
        drawPolyline(polyline);
      } else {
        alert("Sorry, could not find a bicycle route.")
      }
    });

}

const makeStartMarker = (latLng) => {
  console.log(latLng)
  const marker = new maplibregl.Marker({ draggable: true })
    .setLngLat(latLng);
  marker.on('dragend', refreshRoute);
  startMarker = marker;
  return marker;
}

const makeDestMarker = (latLng) => {
  var el = document.createElement('img');
  el.src = "checkered-flag.svg";
  el.style.width = "40px";
  el.style.height = "40px";

  destMarker = new maplibregl.Marker(el, { draggable: true, anchor: 'bottom-left' })
    .setLngLat(latLng);

  destMarker.on('dragend', refreshRoute);
  return destMarker;
}

map.on('click', function (e) {

  const bbox = [
    [e.point.x - 5, e.point.y - 5],
    [e.point.x + 5, e.point.y + 5]
  ];
  // Find features intersecting the bounding box.
  const bikelyFeatures = map.queryRenderedFeatures(bbox, {
    layers: ['poi-bikely']
  });

  if (bikelyFeatures.length === 0) {
    let marker;
    if (!startMarker) {
      marker = makeStartMarker(e.lngLat);
    } else if (!destMarker) {
      marker = makeDestMarker(e.lngLat);
    } else {
      // dest already exists
      destMarker.remove();
      marker = makeDestMarker(e.lngLat);
    }
    marker.addTo(map);

    refreshRoute();
  }
});


const refreshRoute = () => {
  if(startMarker && destMarker) {
    queryAndRender(startMarker.getLngLat(), destMarker.getLngLat());
  }
}
