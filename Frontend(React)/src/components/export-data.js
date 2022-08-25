import React, { useEffect, useState } from 'react';
import { Paper, Typography, TextField, Button } from '@mui/material';
import SelectFilter from './select-filter';

const matchPredictedLabels = {
  0: 'Normal',
  1: 'DoS',
  2: 'U2R',
  3: 'R2L',
  4: 'Probe',
};

const GetFormattedData = (
  data,
  labelType = 'any',
  protocolType = 'any',
  serviceType = 'any'
) => {
  const rows = [];
  data.forEach((dataItem, index) => {
    const shouldAdd =
      labelType === 'any' ||
      matchPredictedLabels[dataItem.predicted_label] === labelType
        ? protocolType === 'any' || dataItem.protocol_type === protocolType
          ? serviceType === 'any' || dataItem.service === serviceType
          : false
        : false;

    if (shouldAdd) {
      rows.push(dataItem);
    }
  });

  return rows;
};

function ExportData({ data, labelType, protocolType, serviceType }) {
  const [startID, setStartID] = useState(1);
  const [endID, setEndID] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const formattedData = GetFormattedData(
      data,
      labelType,
      protocolType,
      serviceType
    );
    setFilteredData(formattedData);
    setEndID(formattedData.length);
  }, [data, labelType, protocolType, serviceType]);

  const ConvertToCSV = objArray => {
    var array = objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line !== '') line += ',';

        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  };

  const exportData = () => {
    let data = filteredData.slice(startID - 1, endID);
    let blob;
    if (downloadFormat === 'csv') {
      data.unshift(Object.keys(filteredData[0]));
      data = ConvertToCSV(data);
      blob = new Blob(['\ufeff', data]);
    } else {
      blob = new Blob([JSON.stringify(data)], { type: 'text/json' });
    }
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `data.${downloadFormat}`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant='h5' sx={{ mb: 2 }} fontWeight='bold' align='center'>
        Export Data
      </Typography>
      <TextField
        fullWidth
        label='Start ID'
        type='number'
        sx={{ my: 1 }}
        value={startID}
        onChange={e => setStartID(e.target.value)}
      />
      <TextField
        fullWidth
        label='End ID'
        type='number'
        sx={{ mt: 1, mb: 2 }}
        value={endID}
        onChange={e => setEndID(e.target.value)}
      />
      <SelectFilter
        options={[
          {
            label: 'csv',
            value: 'csv',
          },
          {
            label: 'json',
            value: 'json',
          },
        ]}
        handleChange={val => setDownloadFormat(val)}
        value={downloadFormat}
        label='Export Format'
        fullWidth={true}
      />
      <Button
        variant='contained'
        color='primary'
        fullWidth
        disabled={filteredData.length === 0 || startID > endID}
        onClick={exportData}
        sx={{ mt: 1 }}
      >
        Export
      </Button>
    </Paper>
  );
}

export default ExportData;
