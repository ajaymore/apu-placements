import {
  LOGGED_IN,
  LOGGED_OUT,
  INITIALIZING,
  FETCHED_ORGANIZATIONS,
  FETCHING_ORGANIZATIONS
} from './actions';

const initialState = {
  auth: {
    user: null,
    currentAction: INITIALIZING
  },
  organizations: {
    list: [],
    currentAction: FETCHING_ORGANIZATIONS
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGGED_IN: {
      return {
        ...state,
        auth: {
          user: action.payload,
          currentAction: LOGGED_IN
        }
      };
    }
    case INITIALIZING: {
      return {
        ...state,
        auth: {
          user: null,
          currentAction: INITIALIZING
        }
      };
    }
    case LOGGED_OUT: {
      return {
        ...state,
        auth: {
          user: null,
          currentAction: LOGGED_OUT
        }
      };
    }
    case FETCHING_ORGANIZATIONS: {
      return {
        ...state,
        organizations: {
          currentAction: FETCHING_ORGANIZATIONS,
          list: []
        }
      };
    }
    case FETCHED_ORGANIZATIONS: {
      return {
        ...state,
        organizations: {
          currentAction: FETCHED_ORGANIZATIONS,
          list: action.payload
        }
      };
    }
    default:
      return state;
  }
};
