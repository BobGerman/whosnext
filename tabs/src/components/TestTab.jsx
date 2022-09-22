import React from "react";
import { app, pages } from "@microsoft/teams-js";
import MediaQuery from 'react-responsive';
import './App.css';

// import FluidService from "../services/fluid.js"

class TestTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      context: {},
      containerId: String
    }
  }

  //React lifecycle method that gets called once a component has finished mounting
  //Learn more: https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount() {
    app.initialize().then(async () => {

      // Get the user context from Teams and set it in the state
      const context = await app.getContext();

      const config = await pages.getConfig();
      const containerId = config?.entityId;
      
      this.setState({
        context: context,
        containerId: containerId
      });
    });
    // Next steps: Error handling using the error object
  }

  render() {
    let meetingId = this.state.context?.meeting?.id ?? "";
    let userPrincipalName = this.state.context?.user?.userPrincipalName ?? "";

    return (
      <div>
        <h1>Who's Next? Test Page</h1>
        <h3>Principal Name:</h3>
        <p>{userPrincipalName}</p>
        <h3>Meeting ID:</h3>
        <p>{meetingId}</p>
        <h3>Container ID:</h3>
        <p>{this.state.containerId}</p>
        <MediaQuery maxWidth={280}>
          <h3>This is the side panel</h3>
          <a href="https://docs.microsoft.com/en-us/microsoftteams/platform/apps-in-teams-meetings/teams-apps-in-meetings">Need more info, open this document in new tab or window.</a>
        </MediaQuery>
      </div>
    );
  }
}

export default TestTab;
