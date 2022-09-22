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

    #people = ["Alice", "Bob", "Charlene"];
    #registeredEventHandlers = [];

    getNewContainer = async () => '12345';

    useContainer = async (id) => { }
  
    addPerson = async (name) => {
        this.#people.push(name);
        await this.#fireChangedEvent();
    }

    removePerson = async (name) => {
        this.#people = this.#people.filter(item => item !== name);
        await this.#fireChangedEvent();
    }

    nextPerson = async () => {
        this.#people.shift();
        await this.#fireChangedEvent();
    }

    getPersonList = async () => {
        return this.#people;
    }

    onNewData = (e) => {
        this.#registeredEventHandlers.push(e);
    }

    #fireChangedEvent = async () => {
        for (let handler of this.#registeredEventHandlers) {
            await handler(this.#people);
        }
    }

}

export default new MockFluidService();