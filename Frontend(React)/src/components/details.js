import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Paper,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DataTable from './data-table';
import SelectFilter from './select-filter';
import axios from 'axios';
import { useQuery } from 'react-query';
import BarChart from './bar-chart';
import PieChart from './pie-chart';
import ExportData from './export-data';
import DetailsBox from './details-box';

const matchPredictedLabels = {
  0: 'Normal',
  1: 'DoS',
  2: 'U2R',
  3: 'R2L',
  4: 'Probe',
};

const getData = (type, data) => {
  const attackTypes = {};

  data.data.forEach(packet => {
    const key =
      type === 'predicted_label'
        ? matchPredictedLabels[packet[type]]
        : packet[type];
    attackTypes[key] = true;
  });

  const filters = Object.keys(attackTypes).map(val => ({
    label: val,
    value: val,
  }));

  filters.unshift({
    label: 'any',
    value: 'any',
  });

  return filters;
};

const getLabels = (key, data) => {
  const labels = {};

  data.forEach(packet => {
    const tempKey =
      key === 'predicted_label'
        ? matchPredictedLabels[packet[key]]
        : packet[key];
    labels[tempKey] = (labels[tempKey] ? labels[tempKey] : 0) + 1;
  });
  return labels;
};

function Details() {
  const [startTimeValue, setStartTimeValue] = useState(
    Date.now() - 60 * 60 * 1000
  );
  const [endTimeValue, setEndTimeValue] = useState(Date.now());
  const [packetType, setPacketType] = useState('any');
  const [protocolType, setProtocolType] = useState('any');
  const [serviceType, setServiceType] = useState('any');
  const [selectedPacketId, setSelectedPacketId] = useState(null);

  const getPackets = () => {
    return axios.get(
      `https://elastic-frost-39957.pktriot.net/events?startTime=${startTimeValue}&endTime=${endTimeValue}`
    );
  };

  const { isLoading, data, isError, error } = useQuery(
    ['packets', endTimeValue, startTimeValue],
    getPackets
  );

  const { isLoading: isStatsLoading, data: statsData } = useQuery(
    ['packets', '1hr'],
    () => {
      return axios.get(
        `https://elastic-frost-39957.pktriot.net/stats?startTime=${
          Date.now() - 60 * 60 * 1000
        }&endTime=${Date.now()}`
      );
    }
  );

  const getTotalAttacks = () => {
    const keys = Object.keys(statsData.data);
    let totalAttacks = 0;

    keys.forEach(key => {
      if (key !== 'total' && key !== 'Normal') {
        totalAttacks += statsData.data[key] > 0 ? 1 : 0;
      }
    });
    return totalAttacks;
  };

  const getMostFrequentAttack = () => {
    const keys = Object.keys(statsData.data);

    let attack = '';
    let maxAttackCount = 0;

    keys.forEach(key => {
      if (key !== 'total' && key !== 'Normal') {
        if (statsData.data[key] > maxAttackCount) {
          maxAttackCount = statsData.data[key];
          attack = key;
        }
      }
    });

    return `${attack} (${maxAttackCount})`;
  };

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <Container maxWidth='xl' sx={{ mb: 7 }}>
      <Box sx={{ mt: 5 }}>
        <Box>
          <Typography
            variant='h5'
            sx={{ mb: 3 }}
            fontWeight='bold'
            color='primary'
          >
            Total packets captured in last 1 hour
          </Typography>
        </Box>
        {!isStatsLoading ? (
          <Box>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <DetailsBox
                  heading='Total Packets'
                  value={statsData.data.total}
                  type='normal'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailsBox
                  heading='Normal Detected'
                  value={statsData.data.Normal}
                  type='success'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailsBox
                  heading='Attack Detected'
                  value={statsData.data.total - statsData.data.Normal}
                  type='warning'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailsBox heading='Total Features' value={42} type='normal' />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailsBox
                  heading='Most Frequent Attack'
                  value={getMostFrequentAttack()}
                  type='warning'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DetailsBox
                  heading='Attack Types Detected'
                  value={getTotalAttacks()}
                  type='warning'
                />
              </Grid>
            </Grid>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography
          variant='h5'
          sx={{ mb: 2 }}
          fontWeight='bold'
          color='primary'
        >
          Filter Packet Details
        </Typography>
        <Box
          sx={{
            my: 3,
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
          }}
        >
          <Box sx={{ mr: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label='Start picker'
                value={startTimeValue}
                onChange={val => setStartTimeValue(val.getTime())}
                renderInput={params => (
                  <TextField
                    helperText='By default startTime value is 1 hour before current time'
                    {...params}
                  />
                )}
                maxDateTime={endTimeValue}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ mr: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label='End Time'
                value={endTimeValue}
                onChange={val => setEndTimeValue(val.getTime())}
                renderInput={params => (
                  <TextField
                    helperText='By default endTime value is current time'
                    {...params}
                  />
                )}
                minDateTime={startTimeValue}
              />
            </LocalizationProvider>
          </Box>

          <SelectFilter
            options={!isLoading ? getData('protocol_type', data) : []}
            handleChange={val => setProtocolType(val)}
            value={protocolType}
            helperText='Filter based on protocol-type'
            label='Protocol-Type'
          />
          <SelectFilter
            options={!isLoading ? getData('predicted_label', data) : []}
            handleChange={val => setPacketType(val)}
            value={packetType}
            helperText='Filter based on Attack-type'
            label='Attack-Type'
          />
          <SelectFilter
            options={!isLoading ? getData('service', data) : []}
            handleChange={val => setServiceType(val)}
            value={serviceType}
            helperText='Filter based on service-type'
            label='Service-Type'
          />
        </Box>
      </Box>
      <Grid container columnSpacing={3}>
        <Grid xs={12} md={8} item>
          {selectedPacketId !== null ? (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ px: 8, py: 2, my: 6 }}>
                <Button
                  variant='contained'
                  sx={{ my: 4 }}
                  onClick={() => {
                    setSelectedPacketId(null);
                  }}
                >
                  Back
                </Button>
                <pre>
                  <code>
                    {JSON.stringify(data.data[selectedPacketId], null, 2)}
                  </code>
                </pre>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography
                    variant='h5'
                    sx={{ mb: 2 }}
                    fontWeight='bold'
                    color='primary'
                  >
                    Packet Details
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant='contained'
                    onClick={() => {
                      setEndTimeValue(Date.now());
                      setStartTimeValue(Date.now() - 60 * 60 * 1000);
                    }}
                  >
                    refresh
                  </Button>
                </Box>
              </Box>
              <DataTable
                data={!isLoading ? data.data : []}
                loading={isLoading}
                labelType={packetType}
                protocolType={protocolType}
                serviceType={serviceType}
                selectPacket={index => setSelectedPacketId(index)}
              />
            </Box>
          )}
        </Grid>
        <Grid xs={12} md={4} item>
          <Box sx={{ height: '100%', mt: 9 }}>
            <ExportData
              data={!isLoading ? data.data : []}
              loading={isLoading}
              labelType={packetType}
              protocolType={protocolType}
              serviceType={serviceType}
            />
          </Box>
        </Grid>
      </Grid>

      {isLoading ? null : (
        <Box sx={{ mt: 5 }}>
          <Box>
            <Typography
              variant='h5'
              sx={{ mb: 2 }}
              fontWeight='bold'
              color='primary'
            >
              Statistics Charts
            </Typography>
          </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ minHeight: '50vh' }}>
                <BarChart
                  chartData={{
                    labels: Object.keys(
                      getLabels('predicted_label', data.data)
                    ),
                    datasets: [
                      {
                        label: 'No of packets for each packet type',
                        data: Object.values(
                          getLabels('predicted_label', data.data)
                        ),
                        backgroundColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                        ],
                      },
                    ],
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <PieChart
                  chartData={{
                    labels: Object.keys(getLabels('protocol_type', data.data)),
                    datasets: [
                      {
                        label: 'No of packets for each Protocol type',
                        data: Object.values(
                          getLabels('protocol_type', data.data)
                        ),
                        backgroundColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 206, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)',
                          'rgba(255, 159, 64, 1)',
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                        ],
                      },
                    ],
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default Details;
