import React from "react";
import { app, pages } from "@microsoft/teams-js";
// import MediaQuery from 'react-responsive';
import './App.css';
import './WhosNext.scss';
import FluidService from "../services/fluid.js"

class TestTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userPrincipalName: '',
      addedName: '',
      meetingId: '',
      containerId: '',
      people: []
    };
    this.inputChange = this.inputChange.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {

    app.initialize().then(async () => {

      const context = await app.getContext();
      const userPrincipalName = context?.user?.userPrincipalName.split('@')[0];
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
      this.setState({
        addedName: ""
      });
    }
  }

  render() {
    const wrapper = { display: 'flex', gap: '8px', alignItems: 'left' };
    const { addedName,userPrincipalName } = this.state;

    return (

      <div className="speaker-list">

        { /* Heading */}
        <h1> Whose turn? </h1>

        { /* Current speaker (if any) */}
        {this.state.people.length > 0 &&
          <h1 className="reveal-text">
            {this.state.people[0]}
          </h1>
        }

        { /* Input box w/title and button */}
        <h2>Add your name to the list to speak</h2>
        <div>
          <input type="text" onChange={this.inputChange} onKeyDown={this.keyDown} value={addedName} />
          <button type="submit" className="inputButton" onClick={async () => {
            await FluidService.addPerson(addedName ? addedName : userPrincipalName);
            this.setState({ addedName: "" });
          }}>+</button>
        </div>

        <div className="divider"></div>

        { /* List heading */}
        <div className="display-list">
          {this.state.people.length > 1 && <div>
            <div className="people-list ">
              <h2>{this.state.people.length - 1} more people waiting to speak</h2>

              { /* List of people waiting to speak  */}
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
              ))}
            </div>
          </div>
          }
        </div>

        { /* Who's next button */ }
        <div style={wrapper}>
          <button onClick={async () => {
            await FluidService.nextPerson();
          }}>
            Who's next
          </button>
        </div>

        { /* Shuffle button */ }
        <div style={wrapper}>
          <button className="shuffle" onClick={async () => {
            await FluidService.shuffle();
          }}>
            Shuffle
          </button>
        </div>
      </div>
    );
  }
}

export default TestTab;
