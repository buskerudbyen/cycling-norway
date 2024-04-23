import React, { useState } from "react";
import { Autocomplete, debounce, TextField } from "@mui/material";

export type Feature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties?: {
    label: string;
  };
};

type Data = {
  features: Feature[];
};

type Props = {
  onChoose: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
};

/**
 * A slimmed down version of the SearchField component.
 */
const AddressField = (props: Props) => {
  const [options, setOptions] = useState<Feature[]>([]);

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
      .then((data: Data) => {
        const newOptions: Feature[] = [];
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
      freeSolo
      getOptionLabel={(option) => (option as Feature).properties?.label ?? ""}
      onInputChange={debounce(inputChanged, 200)}
      options={options}
      onChange={props.onChoose}
      renderInput={(params) => <TextField {...params} label="Destinasjon" />}
      sx={{ width: 300 }}
    />
  );
};

export default AddressField;
