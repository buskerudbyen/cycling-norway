import { Autocomplete, debounce, TextField } from "@mui/material";
import React, { useState } from "react";
import { FeatureCollection, Point, GeoJsonProperties } from "geojson";
import { MapFeature } from "./types";

type Props = {
  onChoose: (
    event: React.SyntheticEvent,
    value: MapFeature | string | null
  ) => void;
  labelText: string;
  rerender: boolean;
};

const SearchField = ({ onChoose, labelText, rerender }: Props) => {
  let [options, setOptions] = useState<MapFeature[]>([]);

  const inputChanged = (event: React.SyntheticEvent, value: string) => {
    const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${value}&lang=en`;

    if (value.length < 3) {
      setOptions([]);
      return;
    }
    fetch(url, {
      headers: {
        "ET-Client-Name": "buskerudbyen-cycling-prototype(mail@leonard.io)",
      },
    })
      .then((response) => response.json())
      .then((data: FeatureCollection<Point, GeoJsonProperties>) => {
        const newOptions: MapFeature[] = [];
        data.features.forEach((feature) => {
          newOptions.push(feature);
        });
        setOptions(newOptions);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Autocomplete
      className="autocomplete"
      key={labelText + "-" + rerender}
      freeSolo
      options={options}
      getOptionLabel={(option) => (option as MapFeature)?.properties?.label ?? ""}
      onInputChange={debounce(inputChanged, 200)}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label={labelText} />}
      onChange={onChoose}
    />
  );
};

export default SearchField;
