import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"

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


// TODO: Move these to an environment file
const FLUID_CONNECTION_TYPE = "remote";  // set to "local" or "remote"
const FLUID_REMOTE_TENANT_ID = "4d24d9a1-624a-49fd-8ad7-e7031abb08e5";        // values from Fluid relay service in Azure
const FLUID_REMOTE_PRIMARY_KEY = "17b2d098a6143f434ae92d5698283810";
const FLUID_REMOTE_ENDPOINT = "https://us.fluidrelay.azure.com";

class FluidService {

    // Service state
    #serviceConfig;
    #client;
    #container;
    #people = [];
    #newDataEventHandler;

    // Constants
    #containerSchema = {
        initialObjects: { diceMap: SharedMap }
    };
    #dice_value_key = "dice-value-key";
    

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
        container.initialObjects.diceMap.set(this.#dice_value_key, 1);

        // Attach to service
        const id = await container.attach();
        this.#container = container;
        return id;
    }

    useContainer = async (id) => {
        const { container } = await this.#client.getContainer(id, this.#containerSchema);
        await container.attach();
        this.#container = container;
        return id;
    }



    
    addPerson = async (name) => {
        this.#people.push(name);
        await this.#fireChangedEvent();
        return;
    }

    removePerson = async (name) => {
        this.#people = this.#people.filter(item => item === name);
        await this.#fireChangedEvent();
        return;
    }

    nextPerson = async () => {
        this.#people.pop();
        await this.#fireChangedEvent();
        return;
    }

    getPersonList = async () => {
        return this.#people;
    }

    onNewData = async (e) => {
        this.#newDataEventHandler = e;
        return;
    }

    #fireChangedEvent = async () => {
        if (this.#newDataEventHandler) {
            await this.#newDataEventHandler(this.#people);
        }
    }


}

export default new FluidService();