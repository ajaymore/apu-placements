import React from 'react';
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import PropTypes from 'prop-types';

const Loading = props => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100
    }}
  >
    <CircularProgress color="accent" size={40} />
    <Typography style={{ marginTop: 20 }}>{props.message}</Typography>
  </div>
);

Loading.PropTypes = {
  message: PropTypes.string.isRequired
};

export default Loading;
