import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { withStyles } from 'material-ui/styles';

function renderInput(inputProps) {
  const { classes, autoFocus, value, ref, ...other } = inputProps;

  return (
    <TextField
      autoFocus={autoFocus}
      className={classes.textField}
      value={value}
      inputRef={ref}
      InputProps={{
        classes: {
          input: classes.input
        },
        ...other
      }}
    />
  );
}

function renderSuggestionsContainer(options) {
  const { containerProps, children } = options;

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative'
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    left: 0,
    right: 0,
    zIndex: 5
  },
  suggestion: {
    display: 'block'
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  textField: {
    width: '100%'
  }
});

class IntegrationAutosuggest extends React.Component {
  state = {
    value: '',
    suggestions: []
  };

  handleSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : this.props.list.filter(item => {
          const keep =
            count < 5 &&
            item[this.props.searchKey].toLowerCase().slice(0, inputLength) ===
              inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  };

  _itemSelected = value => {
    this.props.onChange(value);
    this.setState({
      value: '',
      suggestions: []
    });
  };

  renderSuggestion = (suggestion, { query, isHighlighted }) => {
    const matches = match(suggestion[this.props.searchKey], query);
    const parts = parse(suggestion[this.props.searchKey], matches);

    return (
      <MenuItem
        selected={isHighlighted}
        component="div"
        onClick={this._itemSelected.bind(this, suggestion)}
      >
        <div>
          {parts.map((part, index) => {
            return part.highlight ? (
              <span key={index} style={{ fontWeight: 300 }}>
                {part.text}
              </span>
            ) : (
              <strong key={index} style={{ fontWeight: 500 }}>
                {part.text}
              </strong>
            );
          })}
        </div>
      </MenuItem>
    );
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  handleChange = (event, { newValue }) => {
    if (!newValue) {
      this.setState({
        value: ''
      });
      return;
    }
    this.setState({
      value: newValue
    });
  };

  render() {
    const { classes } = this.props;
    return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion
        }}
        renderInputComponent={renderInput}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={{
          autoFocus: true,
          classes,
          placeholder: this.props.placeholder,
          value: this.state.value,
          onChange: this.handleChange
        }}
      />
    );
  }
}

IntegrationAutosuggest.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IntegrationAutosuggest);
