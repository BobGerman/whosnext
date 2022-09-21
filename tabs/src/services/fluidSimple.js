
import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils"

const serviceConfig = {
    connection: {
        type: "remote",
        tenantId: "4d24d9a1-624a-49fd-8ad7-e7031abb08e5", // REPLACE WITH YOUR TENANT ID
        tokenProvider: new InsecureTokenProvider("17b2d098a6143f434ae92d5698283810" /* REPLACE WITH YOUR PRIMARY KEY */, { id: "userId" }),
        endpoint: "https://us.fluidrelay.azure.com", // REPLACE WITH YOUR AZURE ENDPOINT
    }
};

const client = new AzureClient(serviceConfig);

const diceValueKey = "dice-value-key";


const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};

export const getContainerId = async () => {
    try {
        const { container } = await client.createContainer(containerSchema);
        container.initialObjects.diceMap.set(diceValueKey, 1);
        const id = await container.attach();
        return id;
        }
    catch (error) {
        debugger;
        throw (error);
    }
}
