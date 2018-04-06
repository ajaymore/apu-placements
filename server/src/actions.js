import * as firebase from 'firebase';

export const LOGGED_IN = 'LOGGED_IN';
export const LOGGED_OUT = 'LOGGED_OUT';
export const INITIALIZING = 'INITIALIZING';
export const FETCHING_ORGANIZATIONS = 'FETCHING_ORGANIZATIONS';
export const FETCHED_ORGANIZATIONS = 'FETCHED_ORGANIZATIONS';
const today = new Date();
let year;
if (today.getMonth() > 4) {
  year = `${today.getFullYear()}-${today.getFullYear() + 1}`;
} else {
  year = `${today.getFullYear() - 1}-${today.getFullYear()}`;
}
export const currentYear = year;

export const getOrganizationList = () => {
  return async (dispatch, getState) => {
    dispatch({
      type: FETCHING_ORGANIZATIONS,
      payload: null
    });
    const snap = await firebase
      .database()
      .ref('placements')
      .child(currentYear)
      .child('organizations')
      .once('value');
    dispatch({
      type: FETCHED_ORGANIZATIONS,
      payload: snap.val()
    });
  };
};

export const firebaseLoginInit = () => {
  return (dispatch, getState) => {
    dispatch({
      type: INITIALIZING,
      payload: null
    });
    return firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const tosaveUser = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid
        };
        dispatch({
          type: LOGGED_IN,
          payload: tosaveUser
        });
        try {
          await firebase
            .database()
            .ref('placements')
            .child(currentYear)
            .child('users')
            .child(tosaveUser.uid)
            .set(tosaveUser);
        } catch (err) {
          console.log(err);
        }
      } else {
        dispatch({
          type: LOGGED_OUT,
          payload: null
        });
      }
    });
  };
};
