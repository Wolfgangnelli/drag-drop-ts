import {Project, ProjectStatus} from '../models/project.js';


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
export class ProjectState extends State<Project> {
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

        this.updateListeners();
    }

    moveProject(prjId: string, newStatus: ProjectStatus) {
      const project = this.projects.find(prj => prj.id === prjId);
      if(project && project.status !== newStatus) {
          project.status = newStatus;
          this.updateListeners();
      }   
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
// Global constant singleton instance of project state
export const projectState = ProjectState.getInstance();
