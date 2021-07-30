export default class GeocodeControl {

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.classList.add("maplibregl-ctrl");
    this.container.classList.add("mapboxgl-ctrl");

    const autoComplete = document.getElementById('autocomplete');
    new Autocomplete(autoComplete, {

      debounceTime: 200,

      search: input => {
        const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${input}&lang=en`;

        return new Promise(resolve => {
          if (input.length < 3) {
            return resolve([])
          }

          fetch(url, {
            headers: {
              'ET-Client-Name': 'buskerudbyen-cycling-prototype(mail@leonard.io)'
            }
          })
            .then(response => response.json())
            .then(data => {
              resolve(data.features)
            })
        })
      },

      getResultValue: feature => feature.properties.label,

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


