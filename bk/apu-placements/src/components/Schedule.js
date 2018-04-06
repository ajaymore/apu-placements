import React, { Component } from 'react';
import { getOrganizationList, FETCHING_ORGANIZATIONS } from '../actions';
import { connect } from 'react-redux';
import Loading from './Loading';
import AutoSuggest from './AutoSuggest';
import * as firebase from 'firebase';
import { currentYear } from '../actions';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import moment from 'moment';
import Paper from 'material-ui/Paper';
import AreYouSure from './AreYouSure';

class Schedule extends Component {
  state = {
    schedule: []
  };

  componentDidMount() {
    this.props.getOrganizationList();
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('schedule')
      .on('value', snap => {
        const values = snap.val();
        if (values) {
          let schedule = Object.keys(values).map(item => {
            return { key: item, ...values[item] };
          });
          schedule.sort(function(left, right) {
            left = moment(left.scheduledDate) || moment();
            right = moment(right.scheduledDate) || moment();
            return right.diff(left);
          });
          this.setState({
            schedule
          });
        }
      });
  }

  componentWillUnmount() {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('schedule')
      .off('value');
  }
  itemSelected = value => {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('schedule')
      .child(value.name)
      .set(value);
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
  _dateChange = e => {
    firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('schedule')
      .child(e.target.id)
      .child('scheduledDate')
      .set(moment(e.target.value).valueOf());
  };
  render() {
    const { organizations } = this.props;
    if (organizations.currentAction === FETCHING_ORGANIZATIONS) {
      return <Loading message="Fetching data" />;
    }
    return (
      <div style={{ padding: 40 }}>
        <AutoSuggest
          list={organizations.list}
          searchKey="title"
          onChange={this.itemSelected}
          placeholder="Search for an organization"
        />
        <div style={{ marginTop: 30 }}>
          {this.state.schedule.map(item => (
            <Paper
              key={item.key}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                flexBasis: 1,
                height: 100,
                alignItems: 'center',
                paddingLeft: 20
              }}
            >
              <Button style={{ marginRight: 20 }}>
                <a href={item.url} target="_blank">
                  {item.name}
                </a>
              </Button>
              <TextField
                style={{ marginRight: 20, width: 200 }}
                id={item.name}
                label="Tentative date"
                type="date"
                defaultValue={
                  item.scheduledDate
                    ? moment(item.scheduledDate).format('YYYY-MM-DD')
                    : null
                }
                onChange={this._dateChange}
                InputLabelProps={{
                  shrink: true
                }}
              />
              <AreYouSure
                style={{ marginRight: 20 }}
                action={this._removeItem.bind(this, item.key)}
              />
            </Paper>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    organizations: state.organizations
  };
};

export default connect(mapStateToProps, { getOrganizationList })(Schedule);
