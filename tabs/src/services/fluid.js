import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"

// Service definition:
//
// interface IPersonList {
//     names: string[];        // Array of people who will speak, in order, with current speaker at top
// }
// interface IFluidService {
//     getNewContainer: () => string;          // Gets a new container and returns its ID
//     useContainer: (id: string) => Promise<void>;
//     addPerson: (name: string) => Promise<void>;      // Adds a person to the list
//     removePerson: (name: string) => Promise<void>;   // Removes a person from the list
//     nextPerson: () => Promise<void>;                 // Go to next person
//     getPersonList: () => Promise<IPersonList>;  // Get the current person list
//     // Event handler called when new person list is available
//     onNewData: (handler: (personList: IPersonList) => void) => void;
// }

// TODO: Move these to an environment file
const FLUID_CONNECTION_TYPE = "remote";  // set to "local" or "remote"
const FLUID_REMOTE_TENANT_ID = "4d24d9a1-624a-49fd-8ad7-e7031abb08e5";        // values from Fluid relay service in Azure
const FLUID_REMOTE_PRIMARY_KEY = "17b2d098a6143f434ae92d5698283810";
const FLUID_REMOTE_ENDPOINT = "https://us.fluidrelay.azure.com";

const DICE_VALUE_KEY = "dice-value-key";


class FluidService {

    #serviceConfig;
    #client;
    #container;

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
        const containerSchema = {
            initialObjects: { diceMap: SharedMap }
        };
        const { container } = await this.#client.createContainer(containerSchema);
        container.initialObjects.diceMap.set(DICE_VALUE_KEY, 1);
        const id = await container.attach();
        this.#container = container;
        return id;
    }

}

export default new FluidService();