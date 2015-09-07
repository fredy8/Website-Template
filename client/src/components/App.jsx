import React from 'react';
import $ from 'jquery';

let apiLocation = '{{API_LOCATION}}';
if (apiLocation[0] == '{') {
  apiLocation = 'http://localhost:3000';
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { greeting: 'Loading...' };
  }
  componentDidMount() {
    $.get(apiLocation)
      .done((result) => {
        this.setState({ greeting: result.greeting })
      }).fail((result) => {
        this.setState({ greeting: 'Failed to fetch greeting.' })
      });
  }
  render() {
    return (
      <div>{this.state.greeting}</div>
    );
  }
}
