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

class MockFluidService {

    #people = [];
    #newDataEventHandler;

    #fireChangedEvent = async () => {
        if (this.#newDataEventHandler) {
            await this.#newDataEventHandler(this.#people);
        }
    }

    getNewContainer = async () => {
        return 12345;
    }

    useContainer = async (id) => {
        return;
    }

    addPerson = async (name) => {
        this.#people.push(name);
        await this.#fireChangedEvent();
        return;
    }

    removePerson = async(name) => {
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


}

export default new MockFluidService();