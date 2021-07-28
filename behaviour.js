var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/voyager/style.json?key=HrARH01SH6sg5I6HoXdU',
  center: [10.7445, 59.9114],
  zoom: 14
});

let startMarker, destMarker = null;

map.on('click', function (e) {
  let marker = new maplibregl.Marker({ draggable: true })
    .setLngLat(e.lngLat);

  if(!startMarker) {
    startMarker = marker;
  }
  else if(!destMarker) {
    destMarker = marker;
  } else {
    // dest already exists
    destMarker.remove();
    destMarker = marker;
  }
  marker.addTo(map);
  marker.on('dragend', refreshRoute);

  refreshRoute();
});


const refreshRoute = () => {
  if(startMarker && destMarker) {
    queryAndRender(startMarker.getLngLat(), destMarker.getLngLat());
  }
}

const queryAndRender = (start, dest) => {
  console.log(start, dest)
  fetch("https://api.entur.io/journey-planner/v3/graphql", {
    "method": "POST",
    "headers": {
      "Content-Type": "application/graphql"
    },
    "body": `
{
  trip(from: {coordinates: {latitude: ${start.lat}, longitude: ${start.lng} }}, modes: {directMode: bicycle}, to: {coordinates: {latitude: ${ dest.lat }, longitude: ${dest.lng }}}) {
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
      const polyline = response.data.trip.tripPatterns[0].legs.map(l => l.pointsOnLink.points);
      drawPolyline(polyline);
    });

}

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

  map.addSource('route', {
    'type': 'geojson',
    'data': geojson
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
    padding: 20
  });
}

