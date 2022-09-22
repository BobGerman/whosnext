import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"
import * as dotenv from 'dotenv';
dotenv.config()

// Service definition:
//
// interface IFluidService {
//     getNewContainer: () => string;          // Gets a new container and returns its ID
//     useContainer: (id: string) => Promise<void>;
//     addPerson: (name: string) => Promise<void>;      // Adds a person to the list
//     removePerson: (name: string) => Promise<void>;   // Removes a person from the list
//     nextPerson: () => Promise<void>;                 // Go to next person
//     getPersonList: () => Promise<string[]>;  // Get the current person list
//     // Event handler called when new person list is available
//     onNewData: (handler: (personList: string[]) => void) => void;
// }


const FLUID_CONNECTION_TYPE = process.env.REACT_APP_FLUID_CONNECTION_TYPE; //remote or local
const FLUID_REMOTE_TENANT_ID = process.env.REACT_APP_FLUID_REMOTE_TENANT_ID;       // values from Fluid relay service in Azure
const FLUID_REMOTE_PRIMARY_KEY = process.env.REACT_APP_FLUID_REMOTE_PRIMARY_KEY;
const FLUID_REMOTE_ENDPOINT = process.env.REACT_APP_FLUID_REMOTE_ENDPOINT;


class FluidService {

    // Service state
    #serviceConfig;
    #client;
    #container;
    #people = [];
    #registeredEventHandlers = [];

    // Constants
    #containerSchema = {
        initialObjects: { personMap: SharedMap }
    };
    #personValueKey = "person-value-key";


    constructor() {

        // Set up Fluid client
        if (FLUID_CONNECTION_TYPE === "local") {
            this.#serviceConfig = {
                connection: {
                    type: "local",
                    tokenProvider: new InsecureTokenProvider("", { id: "userId" }),
                    endpoint: "http://localhost:7070",
                }
            };
        } else {
            this.#serviceConfig = {
                connection: {
                    type: "remote",
                    tenantId: FLUID_REMOTE_TENANT_ID,
                    tokenProvider: new InsecureTokenProvider(FLUID_REMOTE_PRIMARY_KEY, { id: "userId" }),
                    endpoint: FLUID_REMOTE_ENDPOINT
                }
            };
        }
        this.#client = new AzureClient(this.#serviceConfig);

    }

    getNewContainer = async () => {
        const { container } = await this.#client.createContainer(this.#containerSchema);
        // Populate the initial data
        container.initialObjects.personMap.set(this.#personValueKey,1);
        // Attach to service
        const id = await container.attach();
        this.#container = container;
        return id;
    }

    useContainer = async (id) => {
        if (!this.#container) {
            const { container } = await this.#client.getContainer(id, this.#containerSchema);
            this.#container = container;            
            const json = this.#container.initialObjects.personMap.get(this.#personValueKey);
            this.#people = JSON.parse(json);
            this.#container.initialObjects.personMap.on("valueChanged", async () => {
                const json = this.#container.initialObjects.personMap.get(this.#personValueKey);
               
                this.#people = JSON.parse(json);
                for (let handler of this.#registeredEventHandlers) {
                    await handler(this.#people);
                }
            });
        }
        return id;
    }

    #updateFluidFromLocal = async () => {
        const json = JSON.stringify(this.#people);
        this.#container.initialObjects.personMap.set(this.#personValueKey, json);
    }

    addPerson = async (name) => {      
        if(this.#people === 1){
            this.#people=[];
        }
        if (!this.#people.includes(name)) {
            this.#people.push(name);
            await this.#updateFluidFromLocal();
        }        
       
    }

    removePerson = async (name) => {
        if (this.#people.includes(name)) {
            this.#people = this.#people.filter(item => item !== name);
        }
        await this.#updateFluidFromLocal();
    }

    nextPerson = async () => {
        this.#people.shift();
        await this.#updateFluidFromLocal();
    }

    getPersonList = async () => {
        return this.#people;
    }

    onNewData = (e) => {
        this.#registeredEventHandlers.push(e);
    }

}

export default new FluidService();