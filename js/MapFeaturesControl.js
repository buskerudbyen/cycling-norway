const layers = [

  {
    text: "Sykkelparkering",
    layer: "poi-bicycle-parking-public"
  },

  {
    text: "Sykkelreparasjonsstasjon",
    layer: "poi-bicycle-repair-station"
  }

];


export default class MapFeaturesControl {

  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.classList.add("maplibregl-ctrl");
    this.container.classList.add("mapboxgl-ctrl");
    this.container.classList.add("mapboxgl-ctrl-group");
    this.container.classList.add("map-features-control");

    layers.forEach(i => {

      const div = document.createElement('div');

      const id = `layer-${i.layer}`;

      const checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.name = "name";
      checkbox.value = "value";
      checkbox.id = id;
      checkbox.checked = "checked";

      checkbox.onclick = () => this.toggleLayer(i.layer);

      const label = document.createElement('label')
      label.htmlFor = id;
      label.appendChild(document.createTextNode(i.text));

      div.appendChild(checkbox);
      div.appendChild(label);

      this.container.appendChild(div);

    });

    return this.container;
  }

  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }

  toggleLayer(clickedLayer) {

    const visibility = this.map.getLayoutProperty(
      clickedLayer,
      'visibility'
    );

    // Toggle layer visibility by changing the layout object's visibility property.
    if (visibility === 'visible' || visibility === undefined) {
      this.map.setLayoutProperty(clickedLayer, 'visibility', 'none');
      this.className = '';
    } else {
      this.className = 'active';
      this.map.setLayoutProperty(
        clickedLayer,
        'visibility',
        'visible'
      );
    }
  }
}


