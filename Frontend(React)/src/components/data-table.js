import * as React from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import SquareIcon from '@mui/icons-material/Square';

const matchPredictedLabels = {
  0: 'Normal',
  1: 'DoS',
  2: 'U2R',
  3: 'R2L',
  4: 'Probe',
};

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 120,
  },
  { field: 'arrivalTime', headerName: 'Arrival Time', width: 250 },
  { field: 'protocolType', headerName: 'Protocol Type', width: 130 },
  { field: 'label', headerName: 'Label', width: 130 },
  {
    field: 'service',
    headerName: 'Service',
    width: 120,
  },
  {
    field: 'actions',
    type: 'actions',
    width: 80,
    getActions: ({ row }) => [
      <GridActionsCellItem
        icon={<SquareIcon color={row.type} />}
        disabled={true}
        size='large'
      />,
    ],
  },
];

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
      const row = {
        id: rows.length + 1,
        arrivalTime: new Date(dataItem.arrivalTime).toLocaleString(),
        protocolType: dataItem.protocol_type,
        label: matchPredictedLabels[dataItem.predicted_label],
        service: dataItem.service,
        type: dataItem.predicted_label === '0' ? 'success' : 'error',
      };

      rows.push(row);
    }
  });

  return rows;
};

export default function DataTable({
  data,
  loading,
  labelType,
  protocolType,
  serviceType,
  selectPacket,
}) {
  return (
    <div style={{ height: 650 }}>
      <DataGrid
        columns={columns}
        rows={GetFormattedData(data, labelType, protocolType, serviceType)}
        pageSize={10}
        rowsPerPageOptions={[5]}
        loading={loading}
        disableColumnSelector={true}
        className='MuiDataGrid-cell--textCenter'
        onRowClick={data => {
          selectPacket(data.row['id'] - 1);
        }}
      />
    </div>
  );
}
