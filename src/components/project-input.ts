import {Component} from './base-component.js';
import {Autobind} from '../decorators/autobind.js';
import {validate, Validatable} from '../util/validation.js';
import {projectState} from '../state/project.js';

/**
 * ProjectInput class
 */
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
        
        this.configure();
    }

    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() {};

  
    private gatherUserInput(): [string, string, number] | void {
       const enteredTitle = this.titleInputElement.value.charAt(0).toUpperCase() + this.titleInputElement.value.substring(1);
       const enteredDescription = this.descriptionInputElement.value;
       const enteredPeople = this.peopleInputElement.value;

       const titleValidatable: Validatable = {
           value: enteredTitle,
           required: true
       }
       const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
    }
    const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
    }

       // check validation
       if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
           alert('Invalid input, please try again!');
           return;
       } else {
           return [
               enteredTitle,
               enteredDescription,
               +enteredPeople
           ];
       }
    }

    private clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event) {
        event.preventDefault();
       // console.log(this.titleInputElement.value);
       const userInput = this.gatherUserInput();
       if(Array.isArray(userInput)) {
           const [title, desc, people] = userInput;
           //console.log(title, desc, people);
           projectState.addProject(title, desc, people);
           this.clearInputs();
       }
    }

}
