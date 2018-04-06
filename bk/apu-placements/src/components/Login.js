import React from 'react';
import Button from 'material-ui/Button';
import signInBtn from '../signin-button.png';
import * as firebase from 'firebase';
import Typography from 'material-ui/Typography';

const login = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/plus.login');
  firebase.auth().signInWithRedirect(provider);
};

export default props => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 100
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
        backgroundColor: '#00796B'
      }}
    >
      <Typography type="display1" style={{ marginBottom: 20 }}>
        Volunteer login
      </Typography>
      <Button onClick={login}>
        <img src={signInBtn} width="230" alt="sign in button" />
      </Button>
    </div>
  </div>
);
