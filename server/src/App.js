import React, { Component } from 'react';
import { connect } from 'react-redux';
import { firebaseLoginInit } from './actions';
import { LOGGED_OUT, INITIALIZING } from './actions';
import { CircularProgress } from 'material-ui/Progress';
import Login from './components/Login';
import Home from './components/Home';
import Typography from 'material-ui/Typography';

class App extends Component {
  componentDidMount() {
    this.props.firebaseLoginInit();
  }
  render() {
    const { currentAction } = this.props.auth;
    if (currentAction === INITIALIZING) {
      return (
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
          <Typography style={{ marginTop: 20 }}>Initializing</Typography>
        </div>
      );
    }
    if (currentAction === LOGGED_OUT) {
      return <Login />;
    }
    return <Home />;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, { firebaseLoginInit })(App);
