var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/voyager/style.json?key=HrARH01SH6sg5I6HoXdU',
  center: [10.7445, 59.9114],
  zoom: 14
});

fetch("https://api.entur.io/journey-planner/v3/graphql", {
  "method": "POST",
  "headers": {
    "Content-Type": "application/graphql"
  },
  "body": `
{
  trip(from: {coordinates: {latitude: 59.9203144, longitude: 10.7128375}}, modes: {directMode: bicycle}, to: {coordinates: {latitude: 59.7351, longitude: 10.1831}}) {
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
  console.log(geojson)

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
      'line-color': '#888',
      'line-width': 8
    }
  });
}

