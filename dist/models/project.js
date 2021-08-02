export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Acitve"] = 0] = "Acitve";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
;
export class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
//# sourceMappingURL=project.js.map