import React from "react";
import { app, pages } from "@microsoft/teams-js";
import MediaQuery from 'react-responsive';
import './App.css';
import './WhosNext.scss';
import FluidService from "../services/fluid.js"

class TestTab extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userPrincipalName: '',
      addedName: '',
      meetingId: '',
      containerId: '',
      people: []
    }
    this.inputChange = this.inputChange.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }
  //React lifecycle method that gets called once a component has finished mounting
  //Learn more: https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount() {
   
    app.initialize().then(async () => {
      const context = await app.getContext();
      const userPrincipalName = context?.user?.userPrincipalName;
      const meetingId = context?.meeting?.id;
      const config = await pages.getConfig();
      const containerId = config?.entityId;
      await FluidService.useContainer(containerId);
      const people = await FluidService.getPersonList();
      this.setState({
        userPrincipalName: userPrincipalName,
        meetingId: meetingId,
        containerId: containerId,
        people: people
      });

      // Update state when fluid data changes
      FluidService.onNewData((people) => {
        this.setState({
          people: people
        });
      });
    });
    // Next steps: Error handling using the error object
  }
  //on text change in input box
  inputChange = (e) => {
    this.setState({
      addedName: e.target.value
    });
  }
  //on key down enter in input box
  keyDown = async (e) => {
    if (e.key === 'Enter') {
      await FluidService.addPerson(e.target.value)
    }
  }
  render() {
    const buttonStyle = {
      backgroundColor: '5b5fc7',
      color: 'white',
      border: 'none',
      fontSize: '14px',
      padding: '5px',
      borderRadius: '5px',
      margin: '5px 0px',
      width: '150px'
    };
    const wrapper = { display: 'flex', gap: '8px', alignItems: 'left' };
    const { addedName,userPrincipalName } = this.state;

    return (
      <div className="speaker-list">
        <h1> Who's turn? </h1>
        {this.state.people.length > 0 &&
          <h1 class="reveal-text">
            {this.state.people[0]}
          </h1>
        }
        <h2>Add your name to the list to speak</h2>
        <div><input type="text" onChange={this.inputChange} onKeyDown={this.keyDown} value={addedName} />
          <button type="submit" className="middle" onClick={async () => {
            await FluidService.addPerson(addedName?addedName:userPrincipalName);
          }}>+</button></div>
        <div class="divider"></div>
        <div className="display-list">
          {this.state.people.length > 1 && <div>
            <div className="people-list ">
              <h2>{this.state.people.length - 1} more people waiting to speak</h2>
              {this.state.people.slice(1).map((item, index) => (
                <li key={index} className="list-item">
                  {item}
                  <div
                    className="close"
                    onClick={async () => {
                      await FluidService.removePerson(item);
                    }}
                  >
                    -
                  </div>
                </li>
              ))}   </div>
          </div>
          }
        </div>
        <div style={wrapper}>
          <button style={buttonStyle} onClick={async () => {
            await FluidService.nextPerson();
          }}>
            Who's next
          </button>
        </div>
        <MediaQuery maxWidth={280}>
          <h3>This is the side panel</h3>
          <a href="https://docs.microsoft.com/en-us/microsoftteams/platform/apps-in-teams-meetings/teams-apps-in-meetings">Need more info, open this document in new tab or window.</a>
        </MediaQuery>
      </div>
    );
  }
}

export default TestTab;
