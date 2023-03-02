import {Autocomplete, debounce, TextField} from "@mui/material";
import React, {useState} from "react";

export default function SearchField({ onChoose, labelText }) {
	let [options, setOptions] = useState([]);
	
	const inputChanged = (event, value) => {
		const url = `https://api.entur.io/geocoder/v1/autocomplete?text=${value}&lang=en`;
		
		if (value.length < 3) {
			setOptions([]);
			return;
		}
		fetch(url, {
			headers: {
				'ET-Client-Name': 'buskerudbyen-cycling-prototype(mail@leonard.io)'
			}
		})
			.then(response => response.json())
			.then(data => {
				let newOptions = [];
				data.features.forEach(feature => {
					newOptions.push(feature);
				});
				setOptions(newOptions);
			})
			.catch((error) => {
				return error;
			})
	}
	
	return (
		<Autocomplete className="autocomplete"
		              freeSolo
		              options={options}
		              getOptionLabel={(option) => option.properties.label || ""}
		              onInputChange={debounce(inputChanged, 200)}
		              sx={{ width: 300 }}
		              renderInput={(params) => <TextField {...params} label={labelText} />}
		              onChange={onChoose}
		/>
	);
}
