import React from 'react';
import Paper from 'material-ui/Paper';
import Tabs, { Tab } from 'material-ui/Tabs';
import Schedule from './Schedule';
import Uploads from './Uploads';
import { connect } from 'react-redux';

class TabView extends React.Component {
  state = {
    value: 2
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    const { user } = this.props.auth;
    return (
      <div>
        <Paper>
          <Tabs
            value={this.state.value}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleChange}
            centered
          >
            <Tab label="Schedule" />
            <Tab label="Uploads" />
            {user.email === 'placements@apu.edu.in' && (
              <Tab label="Volunteers" />
            )}
            {/* <Tab label="News" /> */}
            {/* <Tab label="Downloads" /> */}
          </Tabs>
        </Paper>
        {value === 0 && <Schedule />}
        {value === 1 && <Uploads />}
      </div>
    );
  }
}

export default connect((state, ownProps) => ({ auth: state.auth }))(TabView);
