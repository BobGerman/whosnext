import React from "react";
import { app, FrameContexts } from "@microsoft/teams-js";

import './WhosNext.scss';
import FluidService from "../services/fluidLiveShare.js"

class WhosNextTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      message: 'Connecting to Fluid service...',
      userName: '',
      addedName: '',
      people: []
    };
    this.inputChange = this.inputChange.bind(this);
    this.keyDown = this.keyDown.bind(this);
  }

  componentDidMount() {

    app.initialize().then(async () => {

      try {

        const context = await app.getContext();

        if (context.page.frameContext !== FrameContexts.sidePanel ) {
          this.setState({
            ready: false,
            message: "This tab only works in the side panel of a Teams meeting. Please join the meeting to use it."
          })
          return;
        }
        
        const userName = context?.user?.userPrincipalName.split('@')[0];

        await FluidService.connect();
        const people = await FluidService.getPersonList();
        this.setState({
          ready: true,
          message: "",
          userName: userName,
          people: people
        });

        // Update state when fluid data changes
        FluidService.onNewData((people) => {
          this.setState({
            ready: true,
            people: people,
            message: ""
          });
        });

      } catch (error) {

        this.setState({
          ready: false,
          message: `ERROR: ${error.message}`
        });

      }
    });

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
      try {
        await FluidService.addPerson(e.target.value);
        this.setState({ addedName: "", message: "" });
      } catch (error) {
        this.setState({ message: `ERROR: ${error.message}` });
      }
    }
  }

  render() {
    const { addedName, userName } = this.state;

    if (!this.state.ready) {

      return <div>

        { /* Heading */}
        <h1>Who's next?</h1>
        <br />

        { /* Message */}
        <div class="message">{this.state.message}</div>

      </div>

    } else {

      return (

        <div className="speaker-list">

          { /* Heading */}
          <h1>Who's next?</h1>

          { /* Current speaker (if any) */}
          {this.state.people.length > 0 &&
            <div className="speaker-box">
              <h2>Now speaking:</h2>
              <h1 className="reveal-text">
                {this.state.people[0]}
              </h1>
            </div>
          }

          { /* Input box w/title and button */}
          <h2>Add your name to the list to speak</h2>
          <div className="add-name">
            <input type="text" onChange={this.inputChange} onKeyDown={this.keyDown}
             value={addedName} />
            <button type="submit" onClick={async () => {
              try {
                await FluidService.addPerson(addedName ? addedName : userName);
                this.setState({ addedName: "", message: "" });  
              } catch (error) {
                this.setState({ message: `ERROR: ${error.message}`});
              }
            }}>+</button>
            <div class="message">{this.state.message}</div>
            <hr />
          </div>

          { /* List heading */}
          <div className="display-list">
            {this.state.people.length > 1 && <div>
              <div className="people-list ">
                <h2>{this.state.people.length - 2 ?
                  `${this.state.people.length - 1} more people waiting to speak` :
                  `1 person waiting to speak`}</h2>

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
                      x
                    </div>
                  </li>
                ))}
              </div>
            </div>
            }
          </div>

          { /* Who's next button */}
          <div>
            <button onClick={async () => {
              await FluidService.nextPerson();
            }}>
              Next speaker
            </button>
          </div>

          { /* Shuffle button */}
          <div>
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
}

export default WhosNextTab;
