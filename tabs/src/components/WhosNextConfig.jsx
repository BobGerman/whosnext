import React from "react";
import "./App.css";
import { app, pages } from "@microsoft/teams-js";

// Tab configuration page
class WhosNextConfig extends React.Component {

  componentDidMount() {
    app.initialize().then(async () => {

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
          There's nothing to configure; please click Save to add the Who's Next tab.
        </div>
      </div >
    );
  }
}

export default WhosNextConfig;
