var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/voyager/style.json?key=HrARH01SH6sg5I6HoXdU',
  center: [10.1878, 59.7390],
  zoom: 14
});

let startMarker, destMarker = null;

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

  map.fitBounds(bounds, {
    padding: 100
  });
}

const latLngToString = ({ lat, lng} ) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

const queryAndRender = (start, dest) => {

  const url = new URL(window.location);

  url.searchParams.set('from', latLngToString(start));
  url.searchParams.set('to', latLngToString(dest));
  window.history.pushState({}, '', url);


  fetch("https://api.entur.io/journey-planner/v3/graphql", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/graphql"
    },
    "body": `
{
  trip(bicycleOptimisationMethod: safe, from: {coordinates: {latitude: ${start.lat}, longitude: ${start.lng} }}, modes: {directMode: bicycle}, to: {coordinates: {latitude: ${ dest.lat }, longitude: ${dest.lng }}}) {
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

  let marker;
  if(!startMarker) {
    marker = makeStartMarker(e.lngLat);
  }
  else if(!destMarker) {
    marker = makeDestMarker(e.lngLat);
  } else {
    // dest already exists
    destMarker.remove();
    marker = makeDestMarker(e.lngLat);
  }
  marker.addTo(map);


  refreshRoute();
});


const refreshRoute = () => {
  if(startMarker && destMarker) {
    queryAndRender(startMarker.getLngLat(), destMarker.getLngLat());
  }
}
