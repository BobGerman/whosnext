import { LiveShareClient } from "@microsoft/live-share";
import { app, LiveShareHost } from "@microsoft/teams-js";
import { SharedMap } from "fluid-framework";
import * as dotenv from 'dotenv';
dotenv.config()

// Service definition:
//
// interface IFluidService {
//     connect: () => void;                          // Connect to the Fluid service
//     addPerson: (name: string) => Promise<void>;      // Adds a person to the list
//     removePerson: (name: string) => Promise<void>;   // Removes a person from the list
//     nextPerson: () => Promise<void>;                 // Go to next person
//     shuffle: () => Promise<void>;                    // Shuffle the list of speakers
//     getPersonList: () => Promise<string[]>;          // Get the current person list
//     // Event handler called when new person list is available
//     onNewData: (handler: (personList: string[]) => void) => void;
// }

class FluidService {

    // Service state
    #container;             // Fluid container
    #people = [];           // Local array of people who will speak
    #registeredEventHandlers = [];  // Array of event handlers to call when contents change

    // Constants
    #PERSON_VALUE_KEY = "person-value-key";

    // TODO: Add singleton promise to debounce this function
    connect = async () => {
        try {
            await app.initialize();
            const host = LiveShareHost.create();

            const liveShare = new LiveShareClient(host);
            const { container } = await liveShare.joinContainer({
                initialObjects: { personMap: SharedMap }
            });
            this.#container = container;

            const json = this.#container.initialObjects.personMap.get(this.#PERSON_VALUE_KEY) || "[]";
            this.#people = JSON.parse(json);

            this.#container.initialObjects.personMap.on("valueChanged", async () => {
                const json = this.#container.initialObjects.personMap.get(this.#PERSON_VALUE_KEY);
                this.#people = JSON.parse(json);
                for (let handler of this.#registeredEventHandlers) {
                    await handler(this.#people);
                }
            });

        }
        catch (error) {
            console.log(error);
        }
    }

    // Function to uplodate the Fluid relay from the local array of people
    #updateFluid = async () => {
        const json = JSON.stringify(this.#people);
        this.#container.initialObjects.personMap.set(this.#PERSON_VALUE_KEY, json);
    }

    addPerson = async (name) => {
        if (!this.#people.includes(name)) {
            this.#people.push(name);
            await this.#updateFluid();
        }
    }

    removePerson = async (name) => {
        if (this.#people.includes(name)) {
            this.#people = this.#people.filter(item => item !== name);
        }
        await this.#updateFluid();
    }

    nextPerson = async () => {
        this.#people.shift();
        await this.#updateFluid();
    }

    shuffle = async () => {
        // Use the Fischer-Yates algorithm
        for (let i = this.#people.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            [this.#people[i], this.#people[j]] = [this.#people[j], this.#people[i]];
        }
        await this.#updateFluid();
    }

    getPersonList = async () => {
        return this.#people;
    }

    onNewData = (e) => {
        this.#registeredEventHandlers.push(e);
    }

}

export default new FluidService();