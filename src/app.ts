// Drag & Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void; 
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {Acitve, Finished};
/**
 * Project Type 
 */
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus) {}
}

// Generic type Listener
type Listener<T> = (items: T[]) => void;

/**
 * State Base Class
 */
abstract class State<T> {
    protected listeners: Listener<T>[] = []; //array of function, fn references

    /**
     * Register a listener function
     * @param listenerFn 
     */
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }

}

/**
 * Project State Management class - Singleton class
 */
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
         super();
     }

    static getInstance() {
        if(this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Acitve
        );
        this.projects.push(newProject);

        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
// Global constant singleton instance of project state
const projectState = ProjectState.getInstance();

/**
 * Validation
 */
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}
function validate(validatableInput: Validatable): boolean {
    let isValid = true;
    if(validatableInput.required) {      
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if(validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}


/**
 * Component Base Class - Generic class
 */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = <T>document.getElementById(hostElementId)!;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if(newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
    }

   abstract configure(): void;

   abstract renderContent(): void;
}


/**
 * Project Item Class
 */
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    // Getter (call it like a prop)
    get persons() {
        if(this.project.people === 1) {
            return "1 person";
        }
        return `${this.project.people} persons`;
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @Autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    @Autobind
    dragEndHandler(_: DragEvent) {
        console.log('DragEnd');
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    };
    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + 'assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    };
  
}


/**
 * Project List Class
 */
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
  
        this.assignedProjects = [];

        this.element.id = `${this.type}-projects`;
   
        this.configure();
        this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    @Autobind
    dropHandler(event: DragEvent) {
        //event.preventDefault();
        console.log(event.dataTransfer?.getData('text/plain'));
    }

    @Autobind
    dragLeaveHandler(_: DragEvent) {
        const listEl = this.element.querySelector('ul');
        listEl?.classList.remove('droppable');
    }


    configure() {
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('drop', this.dropHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);

        projectState.addListener((projects: Project[]) => {
            //filtering projects
            const relevantProject = projects.filter(proj => {
                if(this.type === 'active') {
                    return proj.status === ProjectStatus.Acitve;
                }
                    return proj.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProject;
            this.renderProject();
        });

    };

     renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }


    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        //clear the node before re-rendering
        listEl.innerHTML = '';
        for (const prjItem of this.assignedProjects) {
            new ProjectItem(listEl.id, prjItem);
        }

    }  
}


/**
 * Autobind decorator method
 */
 function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFun = originalMethod.bind(this);
            return boundFun;
        }
    }
    return adjDescriptor;
}



/**
 * ProjectInput class
 */
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
