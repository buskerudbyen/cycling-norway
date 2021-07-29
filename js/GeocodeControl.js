export default class GeocodeControl {

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.classList.add("maplibregl-ctrl");
    this.container.classList.add("mapboxgl-ctrl");

    const autoComplete = document.getElementById('autocomplete');
    new Autocomplete(autoComplete, {

      debounceTime: 200,

      // Search function can return a promise
      // which resolves with an array of
      // results. In this case we're using
      // the Wikipedia search API.
      search: input => {
        const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${input}&lang=en`;

        return new Promise(resolve => {
          if (input.length < 3) {
            return resolve([])
          }

          fetch(url, {
            headers: {
              'ET-Client-Name': 'leonard.io-buskerudbyen-cycling'
            }
          })
            .then(response => response.json())
            .then(data => {
              resolve(data.features)
            })
        })
      },

      // Wikipedia returns a format like this:
      //
      // {
      //   pageid: 12345,
      //   title: 'Article title',
      //   ...
      // }
      //
      // We want to display the title
      getResultValue: feature => {

        console.log(feature)
        return feature.properties.label

      },

      // Open the selected article in
      // a new window
      onSubmit: result => {
        map.setCenter(result.geometry.coordinates);
      }
    });

    this.container.appendChild(autoComplete);
    return this.container;
  }

  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}




