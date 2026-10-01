import { memberClasses, projects, state, statusIcons, statusLabels } from "./demo-data.js";
import {
  clearFormError,
  closeDialog,
  escapeHtml,
  formatLongDate,
  formatShortDate,
  getMemberInitials,
  openDialog,
  populateAssigneeOptions,
  showFormError,
  showToast
} from "./utils.js";
import { getCurrentProject, renderProject } from "./project.js";

const taskList = document.querySelector("#task-list");
const createTaskDialog = document.querySelector("#create-task-sheet");
const statusDialog = document.querySelector("#update-status-sheet");
const taskForm = document.querySelector("#create-task-form");

let navigateToScreen;

export function initializeTasks({ navigate }) {
  navigateToScreen = navigate;

  document.querySelector("#open-create-task-fab").addEventListener("click", openCreateTask);
  taskForm.addEventListener("submit", createTask);
  document.querySelector("#edit-task-form").addEventListener("submit", saveTask);
  document.querySelector("#edit-task-toggle").addEventListener("click", () => {
    setTaskEditMode(!state.editingTask);
  });
  document.querySelector("#detail-status-trigger").addEventListener("click", openStatusSheet);
  document.querySelector("#status-form").addEventListener("submit", saveTaskStatus);

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => selectTaskFilter(button.dataset.filter));
  });
}

export function getCurrentTask() {
  const project = getCurrentProject();
  return project?.tasks.find((task) => task.id === state.currentTaskId);
}

export function renderTasks() {
  const project = getCurrentProject();
  if (!project) return;
  const visibleTasks = project.tasks.filter((task) => state.taskFilter === "all" || task.status === state.taskFilter);
  taskList.replaceChildren(...visibleTasks.map(createTaskCard));
  document.querySelector("#task-empty").hidden = visibleTasks.length > 0;
  taskList.querySelectorAll(".task-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.currentTaskId = card.dataset.taskId;
      navigateToScreen("task-detail-screen");
    });
  });
}

function createTaskCard(task) {
  const card = document.createElement("a");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  card.href = `#task-${encodeURIComponent(task.id)}`;
  card.setAttribute("aria-label", `${task.name}, ${statusLabels[task.status]}, ผู้รับผิดชอบ ${task.assignee}`);
  card.innerHTML = `
    <div class="task-card-main"><div class="task-card-title-row"><h3>${escapeHtml(task.name)}</h3><span class="status-badge status-${task.status}">${statusIcons[task.status]}${statusLabels[task.status]}</span></div><div class="task-card-meta"><span class="assignee-meta"><span class="mini-avatar ${memberClasses[task.assignee] || "avatar-lilac"}" aria-hidden="true">${escapeHtml(getMemberInitials(task.assignee))}</span>${escapeHtml(task.assignee)}</span><span class="deadline-meta"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l3 2"></path></svg> ${formatShortDate(task.deadline)}</span></div></div>`;
  return card;
}

export function renderTaskDetail() {
  const task = getCurrentTask();
  if (!task) return navigateToScreen("project-screen", { remember: false });
  const project = getCurrentProject();
  const form = document.querySelector("#edit-task-form");
  document.querySelector("#detail-task-name").textContent = task.name;
  document.querySelector("#detail-task-description").textContent = task.description || "ยังไม่มีรายละเอียดเพิ่มเติมสำหรับภาระงานนี้";
  renderTaskStatus(task.status);
  document.querySelector("#detail-assignee").textContent = task.assignee;
  const avatar = document.querySelector("#detail-assignee-avatar");
  avatar.textContent = getMemberInitials(task.assignee);
  avatar.className = `mini-avatar ${memberClasses[task.assignee] || "avatar-lilac"}`;
  document.querySelector("#detail-deadline").textContent = formatLongDate(task.deadline);
  document.querySelector("#detail-creator").textContent = task.creator;
  form.elements.name.value = task.name;
  form.elements.description.value = task.description || "";
  populateAssigneeOptions(form.elements.assignee, project, task.assignee);
  form.elements.deadline.value = task.deadline;
  clearFormError("edit-task-form-error");
  setTaskEditMode(false);
}

function renderTaskStatus(status) {
  const className = `status-badge status-${status}`;
  const content = `${statusIcons[status]}${statusLabels[status]}`;
  const display = document.querySelector("#detail-status-display");
  const trigger = document.querySelector("#detail-status-trigger");
  display.className = `detail-status-display ${className}`;
  display.innerHTML = content;
  trigger.className = `status-badge detail-status-trigger ${className}`;
  trigger.innerHTML = content;
}

function setTaskEditMode(editing) {
  state.editingTask = editing;
  document.querySelector("#task-detail-view").hidden = editing;
  document.querySelector("#edit-task-form").hidden = !editing;
  document.querySelector("#detail-page-title").textContent = editing ? "แก้ไขภาระงาน" : "รายละเอียดภาระงาน";
  const toggle = document.querySelector("#edit-task-toggle");
  toggle.setAttribute("aria-pressed", String(editing));
  toggle.setAttribute("aria-label", editing ? "ยกเลิกแก้ไขภาระงาน" : "แก้ไขภาระงาน");
}

function openCreateTask() {
  clearFormError("task-form-error");
  populateAssigneeOptions(taskForm.elements.assignee, getCurrentProject());
  openDialog(createTaskDialog);
}

function createTask(event) {
  event.preventDefault();
  const project = getCurrentProject();
  if (!project) return;
  const name = taskForm.elements.name.value.trim();
  const description = taskForm.elements.description.value.trim();
  const assignee = taskForm.elements.assignee.value;
  const deadline = taskForm.elements.deadline.value;
  if (!name || !assignee || !deadline) {
    showFormError("task-form-error", "กรุณากรอกชื่อ ผู้รับผิดชอบ และกำหนดส่งให้ครบถ้วน");
    return;
  }
  clearFormError("task-form-error");
  project.tasks.push({ id: `task-${Date.now()}`, name, description, assignee, deadline, creator: "Sarah J.", status: "pending" });
  project.progressCalculated = true;
  selectTaskFilter("all", false);
  taskForm.reset();
  closeDialog(createTaskDialog);
  renderProject();
  showToast("สร้างภาระงานเรียบร้อยแล้ว", state);
}

function saveTask(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const task = getCurrentTask();
  const project = getCurrentProject();
  if (!task || !project) return;
  const name = form.elements.name.value.trim();
  const assignee = form.elements.assignee.value;
  const deadline = form.elements.deadline.value;
  const status = task.status;
  if (!name || !assignee || !deadline || !statusLabels[status]) {
    showFormError("edit-task-form-error", "กรุณากรอกชื่อ ผู้รับผิดชอบ กำหนดส่ง และสถานะให้ครบถ้วน");
    return;
  }
  clearFormError("edit-task-form-error");
  Object.assign(task, {
    name,
    description: form.elements.description.value.trim(),
    assignee,
    deadline,
    status
  });
  project.progressCalculated = true;
  renderTaskDetail();
  renderProject();
  showToast("บันทึกการแก้ไขภาระงานแล้ว", state);
}

function openStatusSheet() {
  const task = getCurrentTask();
  if (!task || !state.editingTask) return;
  clearFormError("status-form-error");
  document.querySelectorAll('input[name="task-status"]').forEach((radio) => {
    radio.checked = radio.value === task.status;
  });
  openDialog(statusDialog);
}

function saveTaskStatus(event) {
  event.preventDefault();
  const selected = document.querySelector('input[name="task-status"]:checked');
  const task = getCurrentTask();
  const project = getCurrentProject();
  if (!selected || !task || !project) {
    showFormError("status-form-error", "กรุณาเลือกสถานะของภาระงาน");
    return;
  }
  task.status = selected.value;
  project.progressCalculated = true;
  closeDialog(statusDialog);
  renderTaskStatus(task.status);
  renderProject();
  showToast("บันทึกสถานะและอัปเดตความคืบหน้าแล้ว", state);
}

function selectTaskFilter(filterValue, render = true) {
  state.taskFilter = filterValue;
  document.querySelectorAll("[data-filter]").forEach((filter) => {
    const selected = filter.dataset.filter === filterValue;
    filter.classList.toggle("is-selected", selected);
    filter.setAttribute("aria-pressed", String(selected));
  });
  if (render) renderTasks();
}
