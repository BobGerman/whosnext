import React from "react";
import { app, pages } from "@microsoft/teams-js";
import MediaQuery from 'react-responsive';
import './App.css';

import FluidService from "../services/fluidMock.js"

class TestTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      context: {},
      containerId: '',
      people: []
    }
  }

  //React lifecycle method that gets called once a component has finished mounting
  //Learn more: https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount() {
    app.initialize().then(async () => {

      const context = await app.getContext();

      const config = await pages.getConfig();
      const containerId = config?.entityId;
      await FluidService.useContainer(containerId);

      const people = await FluidService.getPersonList();
      this.setState({
        context: context,
        containerId: containerId,
        people: people
      });

      // Update state when fluid data changes
      FluidService.onNewData((people) => {
        this.setState({
          people: people
        });
      });

      // Test scenario
      FluidService.addPerson ("Dino");
      // FluidService.removePerson ("Bob");
      FluidService.nextPerson ();
    });
    // Next steps: Error handling using the error object
  }

  render() {
    let meetingId = this.state.context?.meeting?.id ?? "";
    let userPrincipalName = this.state.context?.user?.userPrincipalName ?? "";

    return (
      <div>
        <h1>Who's Next? Test Page</h1>
        <p>Edit app.jsx and change the import statement to switch back to the normal tab page.</p>
        <h3>Principal Name:</h3>
        <p>{userPrincipalName}</p>
        <h3>Meeting ID:</h3>
        <p>{meetingId}</p>
        <h3>Container ID:</h3>
        <p>{this.state.containerId}</p>
        <hr />
        <p>{this.state.people.map(person => <p>{person}</p>)}</p>
        <MediaQuery maxWidth={280}>
          <h3>This is the side panel</h3>
          <a href="https://docs.microsoft.com/en-us/microsoftteams/platform/apps-in-teams-meetings/teams-apps-in-meetings">Need more info, open this document in new tab or window.</a>
        </MediaQuery>
      </div>
    );
  }
}

export default TestTab;
