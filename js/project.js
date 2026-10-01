import { contacts, memberClasses, projects, state } from "./demo-data.js";
import {
  clearFormError,
  closeDialog,
  escapeHtml,
  formatShortDate,
  getMemberInitials,
  openDialog,
  showFormError,
  showToast
} from "./utils.js";

const projectList = document.querySelector("#project-list");
const projectSearch = document.querySelector("#project-search");
const createProjectDialog = document.querySelector("#create-project-sheet");
const createProjectForm = document.querySelector("#create-project-form");
const memberSelect = document.querySelector("#project-existing-member");
const memberList = document.querySelector("#project-member-list");
const deleteProjectButton = document.querySelector("#delete-project-button");

let navigateToScreen;
let renderTaskList;

export function initializeProjects({ navigate, renderTasks }) {
  navigateToScreen = navigate;
  renderTaskList = renderTasks;

  projectSearch.addEventListener("input", renderProjects);

  document.querySelector("#open-create-project").addEventListener("click", () => {
    resetProjectEditor();
    openDialog(createProjectDialog);
  });

  document.querySelector("#add-existing-member").addEventListener("click", () => {
    const contact = contacts.find((entry) => entry.name === memberSelect.value);
    if (!contact) return showToast("เลือกชื่อผู้ใช้ที่ต้องการเพิ่ม", state);
    state.editingMembers.push({ ...contact });
    populateContactOptions();
    renderProjectMembers();
  });

  document.querySelector("#add-email-member").addEventListener("click", () => {
    const emailInput = document.querySelector("#project-new-member-email");
    const email = emailInput.value.trim().toLowerCase();
    if (!emailInput.validity.valid || !email) {
      showFormError("project-form-error", "กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }
    if (state.editingMembers.some((member) => member.email.toLowerCase() === email)) {
      showFormError("project-form-error", "อีเมลนี้อยู่ในโปรเจคแล้ว");
      return;
    }
    clearFormError("project-form-error");
    state.editingMembers.push({ name: email, email });
    emailInput.value = "";
    renderProjectMembers();
  });

  memberList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-member]");
    if (!removeButton) return;
    state.editingMembers.splice(Number(removeButton.dataset.removeMember), 1);
    populateContactOptions();
    renderProjectMembers();
  });

  createProjectForm.addEventListener("submit", saveProject);
  deleteProjectButton.addEventListener("click", deleteProject);
}

export function getCurrentProject() {
  return projects.find((project) => project.id === state.currentProjectId);
}

function openProject(projectId) {
  state.currentProjectId = projectId;
  state.taskFilter = "all";
  navigateToScreen("project-screen");
}

export function renderProjects() {
  const query = projectSearch.value.trim().toLocaleLowerCase();
  const visibleProjects = projects.filter((project) => `${project.name} ${project.code}`.toLocaleLowerCase().includes(query));
  projectList.replaceChildren(...visibleProjects.map(createProjectCard));
  document.querySelector("#project-count").textContent = `${projects.length} โปรเจค`;
  document.querySelector("#project-empty").hidden = visibleProjects.length > 0;
  projectList.querySelectorAll(".project-card-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openProject(link.closest(".project-card").dataset.projectId);
    });
  });
  projectList.querySelectorAll(".project-menu-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openEditProject(button.closest(".project-card").dataset.projectId);
    });
  });
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";
  card.dataset.projectId = project.id;
  const progress = getProgress(project);
  card.innerHTML = `
    <a class="project-card-link" href="#project-${encodeURIComponent(project.id)}" aria-label="เปิดโปรเจค ${escapeHtml(project.name)} รหัส ${escapeHtml(project.code)}">
      <div class="project-card-top">
        <div class="project-card-title"><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.code)}</p></div>
      </div>
      <div class="card-progress"><div class="progress-heading"><span>ความคืบหน้า</span><strong>${progress}%</strong></div><div class="progress-track" role="progressbar" aria-label="ความคืบหน้า ${escapeHtml(project.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div></div>
      <div class="project-card-bottom"><span class="project-members"><span class="avatar-stack" aria-label="${project.members.length} สมาชิก">${project.members.slice(0, 3).map((member) => `<span class="mini-avatar ${memberClasses[member.name] || "avatar-lilac"}" aria-hidden="true">${escapeHtml(getMemberInitials(member.name))}</span>`).join("")}${project.members.length > 3 ? `<span class="avatar-overflow">+${project.members.length - 3}</span>` : ""}</span></span><span class="project-task-count"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg> ${project.tasks.length} ภาระงาน</span></div>
    </a>
    <button class="card-more project-menu-button" type="button" aria-label="แก้ไขโปรเจค ${escapeHtml(project.name)}"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle></svg></button>`;
  return card;
}

function getProgress(project) {
  if (!project.progressCalculated || project.tasks.length === 0) return project.progress;
  const score = project.tasks.reduce((total, task) => total + (task.status === "done" ? 1 : task.status === "in-progress" ? 0.5 : 0), 0);
  return Math.round(score / project.tasks.length * 100);
}

export function renderProject() {
  const project = getCurrentProject();
  if (!project) return navigateToScreen("home-screen", { remember: false });
  document.querySelector("#current-project-name").textContent = project.name;
  document.querySelector("#current-project-code").textContent = project.code;
  document.querySelector("#project-deadline").textContent = `กำหนดส่ง ${formatShortDate(project.deadline)}`;
  const progress = getProgress(project);
  document.querySelector("#project-progress-label").textContent = `${progress}%`;
  const progressRing = document.querySelector("#project-progress-ring");
  progressRing.style.setProperty("--progress", `${progress}%`);
  progressRing.setAttribute("aria-valuenow", String(progress));
  const counts = { pending: 0, "in-progress": 0, done: 0 };
  project.tasks.forEach((task) => { counts[task.status] += 1; });
  document.querySelector("#count-pending").textContent = counts.pending;
  document.querySelector("#count-progress").textContent = counts["in-progress"];
  document.querySelector("#count-done").textContent = counts.done;
  document.querySelector("#task-total-label").textContent = `${project.tasks.length} ภาระงานในโปรเจคนี้`;
  renderTaskList();
}

function resetProjectEditor() {
  state.editingProjectId = null;
  state.editingMembers = [];
  createProjectForm.reset();
  createProjectForm.elements.name.value = "";
  createProjectForm.elements.code.value = "";
  createProjectForm.elements.deadline.value = "";
  document.querySelector("#create-project-title").textContent = "สร้างโปรเจค";
  createProjectForm.querySelector('[type="submit"]').textContent = "สร้างโปรเจค";
  deleteProjectButton.hidden = true;
  document.querySelector("#project-new-member-email").value = "";
  clearFormError("project-form-error");
  populateContactOptions();
  renderProjectMembers();
}

function populateContactOptions() {
  const availableContacts = contacts.filter((contact) => !state.editingMembers.some((member) => member.name === contact.name));
  memberSelect.replaceChildren(new Option("เลือกชื่อผู้ใช้", ""), ...availableContacts.map((contact) => new Option(contact.name, contact.name)));
}

function renderProjectMembers() {
  memberList.replaceChildren(...state.editingMembers.map((member, index) => {
    const item = document.createElement("li");
    item.className = "member-chip";
    const label = document.createElement("span");
    label.textContent = member.email ? `${member.name} · ${member.email}` : member.name;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "member-chip-remove";
    remove.dataset.removeMember = String(index);
    remove.setAttribute("aria-label", `นำ ${member.name} ออกจากโปรเจค`);
    remove.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"></path></svg>';
    item.append(label, remove);
    return item;
  }));
}

function openEditProject(projectId) {
  const project = projects.find((entry) => entry.id === projectId);
  if (!project) return;
  resetProjectEditor();
  state.editingProjectId = project.id;
  state.editingMembers = project.members.map((member) => ({ ...member }));
  createProjectForm.elements.name.value = project.name;
  createProjectForm.elements.code.value = project.code;
  createProjectForm.elements.deadline.value = project.deadline;
  document.querySelector("#create-project-title").textContent = "แก้ไขโปรเจค";
  createProjectForm.querySelector('[type="submit"]').textContent = "บันทึกการแก้ไข";
  deleteProjectButton.hidden = false;
  populateContactOptions();
  renderProjectMembers();
  openDialog(createProjectDialog);
}

function saveProject(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const name = form.elements.name.value.trim();
  const code = form.elements.code.value.trim();
  const deadline = form.elements.deadline.value;
  if (!name || !code || !deadline) {
    showFormError("project-form-error", "กรุณากรอกชื่อโปรเจค รหัส และกำหนดส่งให้ครบถ้วน");
    return;
  }
  clearFormError("project-form-error");
  if (state.editingProjectId) {
    const project = projects.find((entry) => entry.id === state.editingProjectId);
    if (!project) return showFormError("project-form-error", "ไม่พบโปรเจคที่ต้องการแก้ไข");
    Object.assign(project, { name, code: code.toUpperCase(), deadline, members: state.editingMembers.map((member) => ({ ...member })) });
  } else {
    projects.unshift({ id: `project-${Date.now()}`, name, code: code.toUpperCase(), color: "symbol-green", deadline, members: state.editingMembers.map((member) => ({ ...member })), progress: 0, tasks: [] });
  }
  const wasEditing = Boolean(state.editingProjectId);
  state.editingProjectId = null;
  state.editingMembers = [];
  closeDialog(createProjectDialog);
  renderProjects();
  showToast(wasEditing ? "บันทึกการแก้ไขโปรเจคแล้ว" : "สร้างโปรเจคเรียบร้อยแล้ว", state);
}

function deleteProject() {
  const project = projects.find((entry) => entry.id === state.editingProjectId);
  if (!project || !window.confirm(`ต้องการลบโปรเจค “${project.name}” และภาระงานทั้งหมดหรือไม่?`)) return;
  projects.splice(projects.indexOf(project), 1);
  closeDialog(createProjectDialog);
  if (state.currentProjectId === project.id) state.currentProjectId = null;
  renderProjects();
  showToast("ลบโปรเจคเรียบร้อยแล้ว", state);
}
