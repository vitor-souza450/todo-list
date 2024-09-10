// DOM elements
const addTaskForm = document.querySelector("#add-task-form");
const taskTitle = document.querySelector("#task-title");
const taskDescription = document.querySelector("#task-description");
const taskFilterForm = document.querySelector("#task-filter-form");
const taskFilter = document.querySelector("#task-filter");
const noTasksMessage = document.querySelector("#no-tasks-message");
const taskList = document.querySelector("#task-list");
const taskItemTemplate = document.querySelector("#task-item-template");
const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modal-content");
const modalMessage = document.querySelector("#modal-message");
const modalCloseButton = document.querySelector("#modal-close-button");
const currentYear = document.querySelector("#current-year");

// Events
document.addEventListener("DOMContentLoaded", () => {
  const tasks = retrieveTasks();

  if (tasks.length > 0) tasks.forEach((element) => addTask(element));
});

document.addEventListener("DOMContentLoaded", () => {
  const currentDate = new Date();

  currentYear.innerText = currentDate.getFullYear();
});

document.addEventListener("click", (event) => {
  const targetElement = event.target;

  if (targetElement === modal) toggleModal();
  if (targetElement.classList.contains("task-state-toggle-button"))
    toggleTaskState(targetElement);
  if (targetElement.classList.contains("delete-task-button"))
    deleteTask(targetElement);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.classList.contains("hidden"))
    toggleModal();
});

addTaskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskTitleValue = taskTitle.value.trim();
  const taskDescriptionValue = taskDescription.value.trim();

  if (!taskTitle.checkValidity() || !validateTaskTitle(taskTitleValue)) {
    toggleModal(
      "O título da tarefa é obrigatório e deve conter até 30 caracteres. Por favor, insira um título válido."
    );
    clearField(taskTitle);
    return;
  }

  if (
    !taskDescription.checkValidity() ||
    !validateTaskDescription(taskDescriptionValue)
  ) {
    toggleModal(
      "A descrição da tarefa é obrigatória e deve conter até 50 caracteres. Por favor, insira uma descrição válida."
    );
    clearField(taskDescription);
    return;
  }

  clearField(taskDescription);
  clearField(taskTitle);

  const tasks = retrieveTasks();

  if (
    tasks.some(
      (element) => element.title.toLowerCase() === taskTitleValue.toLowerCase()
    )
  ) {
    toggleModal("Tarefa já adicionada. Por favor, tente novamente.");
    return;
  }

  const task = {
    title: taskTitleValue,
    description: taskDescriptionValue,
    completed: false,
  };

  addTask(task);
  tasks.push(task);
  saveTasks(tasks);
  toggleModal("Tarefa adicionada com sucesso.");
});

taskFilterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskFilterValue = taskFilter.value.trim();

  if (!taskFilter.checkValidity() || !validateTaskFilter(taskFilterValue)) {
    toggleModal("Por favor, selecione uma opção.");
    clearField(taskFilter);
    return;
  }

  clearField(taskFilter);

  const taskItems = document.querySelectorAll("li");

  if (taskItems.length > 0) {
    let hasTasks = false;

    taskItems.forEach((element) => {
      switch (taskFilterValue) {
        case "1":
          if (element.classList.contains("hidden"))
            element.classList.remove("hidden");
          hasTasks = true;
          break;
        case "2":
          if (!element.classList.contains("task-completed")) {
            element.classList.remove("hidden");
            hasTasks = true;
          } else {
            element.classList.add("hidden");
          }

          break;
        case "3":
          if (element.classList.contains("task-completed")) {
            element.classList.remove("hidden");
            hasTasks = true;
          } else {
            element.classList.add("hidden");
          }
      }
    });

    if (!hasTasks) {
      toggleModal(
        "Não existem tarefas nesta categoria. Por favor, tente novamente."
      );

      taskItems.forEach((element) => {
        if (element.classList.contains("hidden"))
          element.classList.remove("hidden");
      });
    }
  } else {
    toggleModal("Não existem tarefas neste momento. Por favor, adicione uma.");
  }
});

modalCloseButton.addEventListener("click", () => toggleModal());

// Functions

// Function that toggles the modal display
function toggleModal(message = undefined) {
  [modal, modalContent].forEach((element) =>
    element.classList.toggle("hidden")
  );
  if (message) modalMessage.innerText = message;
}

// Function that clears a field
function clearField(field) {
  field.value = "";
  if (window.screen.width >= 992) field.focus();
  else field.blur();
}

// Function that validates the task title
function validateTaskTitle(taskTitleValue) {
  return taskTitleValue && taskTitleValue.length <= 30;
}

// Function that validates the task description
function validateTaskDescription(taskDescriptionValue) {
  return taskDescriptionValue && taskDescriptionValue.length <= 50;
}

// Function that retrieves the stored tasks
function retrieveTasks() {
  return JSON.parse(localStorage.getItem("tasks")) ?? [];
}

// Function that adds a task
function addTask({ title, description, completed }) {
  const taskItemClone = taskItemTemplate.content.cloneNode(true);
  const taskItem = taskItemClone.querySelector("li");

  if (completed) taskItem.classList.add("task-completed");
  taskItem.querySelector("h3").innerText = title;
  taskItem.querySelector("p").innerText = description;
  if (taskList.classList.contains("hidden")) toggleTaskList(true);
  taskList.appendChild(taskItem);
}

// Function that toggles the task list display
function toggleTaskList(show) {
  if (show) {
    noTasksMessage.classList.add("hidden");
    taskList.classList.remove("hidden");
  } else {
    noTasksMessage.classList.remove("hidden");
    taskList.classList.add("hidden");
  }
}

// Function that saves the tasks
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Function that toggles the state of a task
function toggleTaskState(taskStateToggleButton) {
  const taskItem = taskStateToggleButton.closest("li");

  taskItem.classList.toggle("task-completed");

  const taskTitle = taskItem.querySelector("h3").innerText;
  const tasks = retrieveTasks();
  const currentTask = tasks.find(
    (element) => element.title.toLowerCase() === taskTitle.toLowerCase()
  );
  const currentTaskIndex = tasks.indexOf(currentTask);

  if (currentTaskIndex !== -1) {
    tasks[currentTaskIndex].completed =
      taskItem.classList.contains("task-completed");
    saveTasks(tasks);
  }
}

// Function that deletes a task
function deleteTask(deleteTaskButton) {
  const taskItem = deleteTaskButton.closest("li");
  const taskTitle = taskItem.querySelector("h3").innerText;

  taskItem.remove();

  if (taskList.innerHTML === "") toggleTaskList(false);

  const tasks = retrieveTasks();
  const updatedTasks = tasks.filter(
    (element) => element.title.toLowerCase() !== taskTitle.toLowerCase()
  );

  if (updatedTasks.length > 0) saveTasks(updatedTasks);
  else localStorage.removeItem("tasks");
}

// Function that validates the task filter
function validateTaskFilter(taskFilterValue) {
  return ["1", "2", "3"].includes(taskFilterValue);
}
