import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

function SelectFilter({
  options,
  handleChange,
  value,
  helperText,
  label,
  ...props
}) {
  return (
    <Box>
      <FormControl
        sx={{
          mr: 5,
          my: {
            xs: 1,
            sm: 0,
          },
          minWidth: {
            xs: '100%',
            sm: 250,
          },
        }}
        {...props}
      >
        <InputLabel id='demo-simple-select-helper-label'>{label}</InputLabel>
        <Select
          labelId='demo-simple-select-helper-label'
          value={value}
          label={label}
          onChange={e => handleChange(e.target.value)}
        >
          {options.map(option => (
            <MenuItem value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
        <FormHelperText>{helperText}</FormHelperText>
      </FormControl>
    </Box>
  );
}

export default SelectFilter;
