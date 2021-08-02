var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("components/base-component", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Component = void 0;
    var Component = (function () {
        function Component(templateId, hostElementId, insertAtStart, newElementId) {
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElementId);
            var importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        Component.prototype.attach = function (insertAtBeginning) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        };
        return Component;
    }());
    exports.Component = Component;
});
define("decorators/autobind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Autobind = void 0;
    function Autobind(_, _2, descriptor) {
        var originalMethod = descriptor.value;
        var adjDescriptor = {
            configurable: true,
            get: function () {
                var boundFun = originalMethod.bind(this);
                return boundFun;
            }
        };
        return adjDescriptor;
    }
    exports.Autobind = Autobind;
});
define("util/validation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validate = void 0;
    function validate(validatableInput) {
        var isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }
    exports.validate = validate;
});
define("models/project", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Project = exports.ProjectStatus = void 0;
    var ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Acitve"] = 0] = "Acitve";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = exports.ProjectStatus || (exports.ProjectStatus = {}));
    ;
    var Project = (function () {
        function Project(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
        return Project;
    }());
    exports.Project = Project;
});
define("state/project", ["require", "exports", "models/project"], function (require, exports, project_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.projectState = exports.ProjectState = void 0;
    var State = (function () {
        function State() {
            this.listeners = [];
        }
        State.prototype.addListener = function (listenerFn) {
            this.listeners.push(listenerFn);
        };
        return State;
    }());
    var ProjectState = (function (_super) {
        __extends(ProjectState, _super);
        function ProjectState() {
            var _this = _super.call(this) || this;
            _this.projects = [];
            return _this;
        }
        ProjectState.getInstance = function () {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        };
        ProjectState.prototype.addProject = function (title, description, numOfPeople) {
            var newProject = new project_js_1.Project(Math.random().toString(), title, description, numOfPeople, project_js_1.ProjectStatus.Acitve);
            this.projects.push(newProject);
            this.updateListeners();
        };
        ProjectState.prototype.moveProject = function (prjId, newStatus) {
            var project = this.projects.find(function (prj) { return prj.id === prjId; });
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        };
        ProjectState.prototype.updateListeners = function () {
            for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
                var listenerFn = _a[_i];
                listenerFn(this.projects.slice());
            }
        };
        return ProjectState;
    }(State));
    exports.ProjectState = ProjectState;
    exports.projectState = ProjectState.getInstance();
});
define("components/project-input", ["require", "exports", "components/base-component", "decorators/autobind", "util/validation", "state/project"], function (require, exports, base_component_js_1, autobind_js_1, validation_js_1, project_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectInput = void 0;
    var ProjectInput = (function (_super) {
        __extends(ProjectInput, _super);
        function ProjectInput() {
            var _this = _super.call(this, 'project-input', 'app', true, 'user-input') || this;
            _this.titleInputElement = _this.element.querySelector('#title');
            _this.descriptionInputElement = _this.element.querySelector('#description');
            _this.peopleInputElement = _this.element.querySelector('#people');
            _this.configure();
            return _this;
        }
        ProjectInput.prototype.configure = function () {
            this.element.addEventListener('submit', this.submitHandler);
        };
        ProjectInput.prototype.renderContent = function () { };
        ;
        ProjectInput.prototype.gatherUserInput = function () {
            var enteredTitle = this.titleInputElement.value.charAt(0).toUpperCase() + this.titleInputElement.value.substring(1);
            var enteredDescription = this.descriptionInputElement.value;
            var enteredPeople = this.peopleInputElement.value;
            var titleValidatable = {
                value: enteredTitle,
                required: true
            };
            var descriptionValidatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            };
            var peopleValidatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5
            };
            if (!validation_js_1.validate(titleValidatable) || !validation_js_1.validate(descriptionValidatable) || !validation_js_1.validate(peopleValidatable)) {
                alert('Invalid input, please try again!');
                return;
            }
            else {
                return [
                    enteredTitle,
                    enteredDescription,
                    +enteredPeople
                ];
            }
        };
        ProjectInput.prototype.clearInputs = function () {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInputElement.value = "";
        };
        ProjectInput.prototype.submitHandler = function (event) {
            event.preventDefault();
            var userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                var title = userInput[0], desc = userInput[1], people = userInput[2];
                project_js_2.projectState.addProject(title, desc, people);
                this.clearInputs();
            }
        };
        __decorate([
            autobind_js_1.Autobind
        ], ProjectInput.prototype, "submitHandler", null);
        return ProjectInput;
    }(base_component_js_1.Component));
    exports.ProjectInput = ProjectInput;
});
define("models/drag-drop", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("components/project-item", ["require", "exports", "components/base-component", "decorators/autobind"], function (require, exports, base_component_js_2, autobind_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectItem = void 0;
    var ProjectItem = (function (_super) {
        __extends(ProjectItem, _super);
        function ProjectItem(hostId, project) {
            var _this = _super.call(this, 'single-project', hostId, false, project.id) || this;
            _this.project = project;
            _this.configure();
            _this.renderContent();
            return _this;
        }
        Object.defineProperty(ProjectItem.prototype, "persons", {
            get: function () {
                if (this.project.people === 1) {
                    return "1 person";
                }
                return this.project.people + " persons";
            },
            enumerable: false,
            configurable: true
        });
        ProjectItem.prototype.dragStartHandler = function (event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = 'move';
        };
        ProjectItem.prototype.dragEndHandler = function (_) {
            console.log('DragEnd');
        };
        ProjectItem.prototype.configure = function () {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        };
        ;
        ProjectItem.prototype.renderContent = function () {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = this.persons + 'assigned';
            this.element.querySelector('p').textContent = this.project.description;
        };
        ;
        __decorate([
            autobind_js_2.Autobind
        ], ProjectItem.prototype, "dragStartHandler", null);
        __decorate([
            autobind_js_2.Autobind
        ], ProjectItem.prototype, "dragEndHandler", null);
        return ProjectItem;
    }(base_component_js_2.Component));
    exports.ProjectItem = ProjectItem;
});
define("components/project-list", ["require", "exports", "models/project", "components/base-component", "state/project", "decorators/autobind", "components/project-item"], function (require, exports, project_js_3, base_component_js_3, project_js_4, autobind_js_3, project_item_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProjectList = void 0;
    var ProjectList = (function (_super) {
        __extends(ProjectList, _super);
        function ProjectList(type) {
            var _this = _super.call(this, 'project-list', 'app', false, type + "-projects") || this;
            _this.type = type;
            _this.assignedProjects = [];
            _this.element.id = _this.type + "-projects";
            _this.configure();
            _this.renderContent();
            return _this;
        }
        ProjectList.prototype.dragOverHandler = function (event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                var listEl = this.element.querySelector('ul');
                listEl.classList.add('droppable');
            }
        };
        ProjectList.prototype.dropHandler = function (event) {
            var prjId = event.dataTransfer.getData('text/plain');
            project_js_4.projectState.moveProject(prjId, this.type === 'active' ? project_js_3.ProjectStatus.Acitve : project_js_3.ProjectStatus.Finished);
        };
        ProjectList.prototype.dragLeaveHandler = function (_) {
            var listEl = this.element.querySelector('ul');
            listEl === null || listEl === void 0 ? void 0 : listEl.classList.remove('droppable');
        };
        ProjectList.prototype.configure = function () {
            var _this = this;
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('drop', this.dropHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            project_js_4.projectState.addListener(function (projects) {
                var relevantProject = projects.filter(function (proj) {
                    if (_this.type === 'active') {
                        return proj.status === project_js_3.ProjectStatus.Acitve;
                    }
                    return proj.status === project_js_3.ProjectStatus.Finished;
                });
                _this.assignedProjects = relevantProject;
                _this.renderProject();
            });
        };
        ;
        ProjectList.prototype.renderContent = function () {
            var listId = this.type + "-projects-list";
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = this.type.toUpperCase() + 'PROJECTS';
        };
        ProjectList.prototype.renderProject = function () {
            var listEl = document.getElementById(this.type + "-projects-list");
            listEl.innerHTML = '';
            for (var _i = 0, _a = this.assignedProjects; _i < _a.length; _i++) {
                var prjItem = _a[_i];
                new project_item_js_1.ProjectItem(listEl.id, prjItem);
            }
        };
        __decorate([
            autobind_js_3.Autobind
        ], ProjectList.prototype, "dragOverHandler", null);
        __decorate([
            autobind_js_3.Autobind
        ], ProjectList.prototype, "dropHandler", null);
        __decorate([
            autobind_js_3.Autobind
        ], ProjectList.prototype, "dragLeaveHandler", null);
        return ProjectList;
    }(base_component_js_3.Component));
    exports.ProjectList = ProjectList;
});
define("app", ["require", "exports", "components/project-input", "components/project-list"], function (require, exports, project_input_js_1, project_list_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    new project_input_js_1.ProjectInput();
    new project_list_js_1.ProjectList('active');
    new project_list_js_1.ProjectList('finished');
});
//# sourceMappingURL=bundle.js.map