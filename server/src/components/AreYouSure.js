import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';

export default class AreYouSure extends React.Component {
  state = {
    open: false,
    text: ''
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  action = () => {
    this.props.action();
    this.setState({ open: false, text: '' });
  };

  render() {
    return (
      <div>
        <IconButton
          color="accent"
          aria-label="remove"
          onClick={this.handleClickOpen}
        >
          <DeleteIcon />
        </IconButton>
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent />
          <DialogActions>
            <Button onClick={this.handleRequestClose}>Cancel</Button>
            <Button onClick={this.action} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
