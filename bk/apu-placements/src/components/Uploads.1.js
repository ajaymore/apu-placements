import React, { Component } from 'react';
import * as firebase from 'firebase';
import { currentYear } from '../actions';
import moment from 'moment';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';

class Schedule extends Component {
  state = {
    uploads: [],
    folderName: ''
  };

  componentDidMount() {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('uploads')
      .on('value', snap => {
        const values = snap.val();
        if (values) {
          let uploads = Object.keys(values).map(item => {
            return { key: item, ...values[item] };
          });
          uploads.sort((left, right) => left.name > right.name);
          if (values) {
            this.setState({
              uploads
            });
          }
        }
      });
  }

  componentWillUnmount() {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('uploads')
      .off('value');
  }
  _addItem = () => {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('uploads')
      .push({ name: this.state.folderName });
    this.setState({ folderName: '' });
  };
  _removeItem = key => {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('schedule')
      .child(key)
      .set(null);
  };
  render() {
    return (
      <div style={{ padding: 40 }}>
        <TextField
          id="full-width"
          label="New upload folder"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="Enter a name..."
          fullWidth
          margin="normal"
          value={this.state.folderName}
          onChange={e => this.setState({ folderName: e.target.value })}
        />
        <Button raised color="primary" onClick={this._addItem}>
          Add Volunteer
        </Button>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.state.volunteers.map(item => (
            <Paper key={item.key} style={{ margin: 10, padding: 10 }}>
              <div>{item.name}</div>
            </Paper>
          ))}
        </div>
      </div>
    );
  }
}

export default Schedule;
