import { Autocomplete, TextField, debounce } from "@mui/material";
import type React from "react";
import { type CSSProperties, useState } from "react";
import { FeatureCollection, Point, GeoJsonProperties } from "geojson";
import type { MapFeature } from "../types";

type Props = {
  className?: string;
  endAdornment?: JSX.Element;
  onChoose: (
    event: React.SyntheticEvent,
    value: MapFeature | string | null,
  ) => void;
  labelText: string;
  rerender: boolean;
  sx?: CSSProperties;
};

const SearchField = (props: Props) => {
  const [options, setOptions] = useState<MapFeature[]>([]);

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

  // TODO: It would be nice to show the label of the selected place, or "Din
  //       posisjon" if it's a pin, or "Din startposisjon" if it's your live
  //       location. However, this requires using <Autocomplete> as a controlled
  //       component with the value prop. This has been attempted, but turned
  //       out to be harder than expected due to <Autocomplete> calling
  //       onInputChanged in an unpredictable manner. So to achieve what we want
  //       we should just use a <TextField> and handle the value and options
  //       ourselves.
  return (
    <Autocomplete
      className={`autocomplete ${props.className ?? ""}`}
      key={`${props.labelText}-${props.rerender}`}
      freeSolo
      options={options}
      getOptionLabel={(option) => (option as MapFeature).properties?.label ?? ""}
      onInputChange={debounce(inputChanged, 200)}
      sx={{ width: 300, ...props.sx }}
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
