const convertFeature = (feature) => {
  const { source_id, name } = props;
  console.log(feature);
  feature.id = source_id;
  feature.text = name;
  feature.place_name = name;
  return feature;
}

const toCarmen = (json, searchTerm) => {
  console.log(json);
  json.query = [searchTerm];
  const features = json.features.map(convertFeature);
  json.features = features;
  return json;
}

const geocode = (searchTerm, opts) => {
  return fetch(`https://api.entur.io/geocoder/v1/autocomplete?text=${searchTerm}&lang=en`)
    .then(r => r.json())
    .then(json => toCarmen(json, searchTerm));
};

export { geocode };
