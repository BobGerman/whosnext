import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"

// TODO: Move these to an environment file
const FLUID_CONNECTION_TYPE = "local";  // set to "local" or "remote"
const FLUID_REMOTE_TENANT_ID = "";        // values from Fluid relay service in Azure
const FLUID_REMOTE_PRIMARY_KEY = "";
const FLUID_REMOTE_ENDPOINT = "";

const DICE_VALUE_KEY = "dice-value-key";

export class FluidService {

    #serviceConfig;
    #client;
    #container;
    #containerSchema = {
        initialObjects: { diceMap: SharedMap }
    }

    constructor() {
        let serviceConfig;
        let client;
        let container;
        const containerSchema = {
            initialObjects: { diceMap: SharedMap }
        };
        // Set up Fluid client
        if (FLUID_CONNECTION_TYPE === "local") {
            serviceConfig = {
                connection: {
                    type: "local",
                    tokenProvider: new InsecureTokenProvider("", { id: "userId" }),
                    endpoint: "http://localhost:7070",
                }
            };
        } else {
            serviceConfig = {
                connection: {
                    type: "remote",
                    tenantId: FLUID_REMOTE_TENANT_ID,
                    tokenProvider: new InsecureTokenProvider(FLUID_REMOTE_PRIMARY_KEY, { id: "userId" }),
                    endpoint: FLUID_REMOTE_ENDPOINT
                }
            };
        }
        client = new AzureClient(serviceConfig);

        client.createContainer(containerSchema).then((container) => {
            container = container;
            container.initialObjects.diceMap.set(DICE_VALUE_KEY, 1);
            container.attach().then((id) => {
                alert(`id is ${id}`);
            });
        });
    }

    createNewContainer = async () => {
        this.#container = await this.#client.createContainer(this.#containerSchema);
        this.#container.initialObjects.diceMap.set(DICE_VALUE_KEY, 1);
        const id = await this.#container.attach();
        return id;
    }

}