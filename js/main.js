import { projects, state } from "./demo-data.js";
import { closeDialog } from "./utils.js";
import { initializeProjects, renderProject, renderProjects } from "./project.js";
import { initializeTasks, renderTaskDetail, renderTasks } from "./task.js";

const screens = [...document.querySelectorAll(".screen")];

function navigate(screenId, { remember = true } = {}) {
  if (!document.getElementById(screenId)) return;
  if (remember && state.currentScreen !== screenId) state.history.push(state.currentScreen);
  state.currentScreen = screenId;
  screens.forEach((screen) => { screen.hidden = screen.id !== screenId; });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (screenId === "home-screen") renderProjects();
  if (screenId === "project-screen") renderProject();
  if (screenId === "task-detail-screen") renderTaskDetail();
  if (screenId === "profile-screen") renderProfile();
}

function goBack() {
  if (state.currentScreen === "task-detail-screen") {
    navigate("project-screen", { remember: false });
  } else if (state.currentScreen === "project-screen" || state.currentScreen === "profile-screen") {
    navigate("home-screen", { remember: false });
  } else {
    navigate(state.history.pop() || "home-screen", { remember: false });
  }
}

function renderProfile() {
  const allTasks = projects.flatMap((project) => project.tasks);
  const completedTasks = allTasks.filter((task) => task.status === "done").length;
  const inProgressTasks = allTasks.filter((task) => task.status === "in-progress").length;
  document.querySelector("#profile-project-count").textContent = projects.length;
  document.querySelector("#profile-task-count").textContent = completedTasks;
  document.querySelector("#profile-progress-count").textContent = `${allTasks.length ? Math.round(inProgressTasks / allTasks.length * 100) : 0}%`;
}

function initializeApp() {
  initializeProjects({ navigate, renderTasks });
  initializeTasks({ navigate });

  document.querySelector("#login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#login-email").value.trim();
    const password = document.querySelector("#login-password").value;
    const error = document.querySelector("#login-error");
    if (!email || !password) {
      error.textContent = "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    state.history = [];
    navigate("home-screen");
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  document.querySelectorAll(".bottom-sheet").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  document.querySelectorAll("[data-back]").forEach((button) => button.addEventListener("click", goBack));
  document.querySelectorAll("[data-navigate]").forEach((button) => {
    button.addEventListener("click", () => {
      const destination = button.dataset.navigate;
      if (destination === "home") navigate("home-screen");
      if (destination === "profile") navigate("profile-screen");
    });
  });

  document.querySelector("#logout-button").addEventListener("click", () => {
    document.querySelector("#login-form").reset();
    navigate("login-screen", { remember: false });
    state.history = [];
  });
}

initializeApp();
