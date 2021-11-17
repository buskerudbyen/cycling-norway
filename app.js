import GeocoderControl from "./js/GeocodeControl.js";
import MapFeaturesControl from "./js/MapFeaturesControl.js";

const center = [10.1878, 59.7390];
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/voyager/style.json?key=HrARH01SH6sg5I6HoXdU',
  center: center,
  zoom: 14,
  hash: true
});

["parking", "covered", "shed", "locker"].forEach(icon => {

  ["public", "private"].forEach(access => {
    const name = `bicycle_${icon}_${access}`;
    map.loadImage(`img/png/${name}.png`, function(error, image) {
      if (error) throw error;
      map.addImage(name, image, { sdf: false });
    });
  })

});

map.addControl(new maplibregl.NavigationControl(), "bottom-left");

// Add the control to the map.
map.addControl(
  new GeocoderControl({
    accessToken: "pk.eyJ1IjoibGVvbmFyZGVocmVuZnJpZWQiLCJhIjoiY2l1ZWk1cjlsMDAxZTJ2cWxmNHowbmVvdCJ9.jd86A83HNqNlNyjRY0iGIg",
    mapboxgl: maplibregl,
    placeholder: "Type to search origin",
    anchor: "top-left",
    marker: false
  }),
  "top-left"
);

// Toggle map features
map.addControl(
  new MapFeaturesControl({
    mapboxgl: maplibregl
  }),
  "top-right"
);



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
  map.addSource('bicycle-parking', {
    'type': 'vector',
    'tiles': [ 'https://byvekstavtale.leonard.io/tiles/bicycle-parking/{z}/{x}/{y}.pbf' ],
    'minzoom': 6,
    'maxzoom': 14
  });

  map.addLayer({
    "id": "bicycle-parking",
    "source": "bicycle-parking",
    'source-layer': 'bicycle_parking',
    'type': 'symbol',
    'layout': {
      'visibility': 'visible',
      'icon-image': ["get", "class"],
      "icon-size": {
        "base": 0.25,
        "stops": [
          [
            11,
            0.1
          ],
          [
            20,
            0.3
          ]
        ]
      }
    }
  });

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
