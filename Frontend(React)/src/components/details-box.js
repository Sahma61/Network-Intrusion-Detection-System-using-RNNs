import React from 'react';
import { Paper, Typography } from '@mui/material';

function DetailsBox({ heading, value, type }) {
  return (
    <Paper
      sx={{
        py: 3,
        px: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor:
          type === 'normal'
            ? '#5571c9'
            : type === 'success'
            ? '#36c336'
            : '#cf2424de',
      }}
      elevation={2}
    >
      <Typography variant='h5' color='white'>
        {heading}
      </Typography>
      <Typography variant='h5' color='white'>
        {value}
      </Typography>
    </Paper>
  );
}

export default DetailsBox;
