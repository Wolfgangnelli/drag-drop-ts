/// <reference path="base-component.ts" />

namespace App {
    /**
 * Project List Class
 */
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
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
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Acitve : ProjectStatus.Finished);

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

}