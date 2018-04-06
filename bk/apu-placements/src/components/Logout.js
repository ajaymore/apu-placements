import React from 'react';
import Button from 'material-ui/Button';
import * as firebase from 'firebase';

const logout = () => {
  firebase
    .auth()
    .signOut()
    .then(function() {
      // Sign-out successful.
    })
    .catch(function(error) {
      // An error happened.
    });
};

export default () => (
  <Button raised color="accent" onClick={logout}>
    Logout
  </Button>
);
