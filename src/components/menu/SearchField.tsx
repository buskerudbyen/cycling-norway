import React, { useState } from "react";
import { Autocomplete, debounce, TextField } from "@mui/material";
import { Feature } from "../types";

type Props = {
  className?: string;
  disableClearable?: boolean;
  endAdornment?: JSX.Element;
  onChoose: (
    event: React.SyntheticEvent,
    value: Feature | string | null
  ) => void;
  labelText: string;
  rerender: boolean;
};

type Data = {
  features: Feature[];
};

const SearchField = (props: Props) => {
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
      className={`autocomplete ${props.className ?? ""}`}
      disableClearable={props.disableClearable}
      key={props.labelText + "-" + props.rerender}
      freeSolo
      options={options}
      getOptionLabel={(option) => (option as Feature).properties?.label ?? ""}
      onInputChange={debounce(inputChanged, 200)}
      sx={{ width: 300 }}
      onChange={props.onChoose}
      size={props.endAdornment ? "medium" : "small"}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.labelText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {props.endAdornment}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default SearchField;
