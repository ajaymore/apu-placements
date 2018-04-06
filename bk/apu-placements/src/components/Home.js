import React from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Logout from './Logout';
import TabView from './TabView';

const styles = theme => ({
  root: {
    marginTop: 0,
    width: '100%'
  },
  flex: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
});

const Home = ({ classes }) => (
  <div className={classes.root}>
    <AppBar position="static">
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          color="contrast"
          aria-label="Menu"
        >
          <MenuIcon />
        </IconButton>
        <Typography type="title" color="inherit" className={classes.flex}>
          APU Placements
        </Typography>
        <Logout />
      </Toolbar>
    </AppBar>
    <TabView />
  </div>
);

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
