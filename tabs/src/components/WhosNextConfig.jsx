import React from "react";
import "./App.css";
import { app, pages } from "@microsoft/teams-js";

// import FluidService from "../services/fluid.js"

// Tab configuration page
class WhosNextConfig extends React.Component {

  componentDidMount() {
    app.initialize().then(async () => {

      // let containerId;

      // Get the container id, which is saved as the tab's entity ID
      // const config = await pages.getConfig();
      // containerId = config?.entityId;
      
      // TODO: Drop this entirely if Live Share works
      // containerId = containerId || 123;
      // if (!containerId) {
      //   containerId = await FluidService.getNewContainer();
      // }

      // this.setState({
      //   containerId: 0 // containerId
      // });

      //  When the user clicks "Save", save the updated configuration
      pages.config.registerOnSaveHandler(async (saveEvent) => {
        const baseUrl = `https://${window.location.hostname}:${window.location.port}`;
        await pages.config.setConfig({
          suggestedDisplayName: "Who's next?",
          entityId: "WhosNext",
          contentUrl: baseUrl + "/index.html#/tab",
          websiteUrl: baseUrl + "/index.html#/tab",
        });
        saveEvent.notifySuccess();
      });

      // OK all set up, enable the "save" button
      pages.config.setValidityState(true);

    });
  }


  render() {

    return (
      <div>
        <h1>Tab Configuration</h1>
        <div>
          {this.state?.containerId ? 
            `We have configured container ${this.state.containerId} for this tab. Please click the Save button to continue.`
            :
            "Loading ..."
          }
        </div>
      </div >
    );
  }
}

export default WhosNextConfig;
