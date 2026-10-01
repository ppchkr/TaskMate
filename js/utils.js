import { memberInitials } from "./demo-data.js";

export function getMemberInitials(name) {
  if (memberInitials[name]) return memberInitials[name];
  return name.split("@")[0].split(/[._-]/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "?";
}

export function populateAssigneeOptions(select, project, selectedName = "") {
  const members = [...(project?.members || [])];
  if (selectedName && !members.some((member) => member.name === selectedName)) {
    members.push({ name: selectedName, email: selectedName.includes("@") ? selectedName : "" });
  }
  select.replaceChildren(new Option("เลือกสมาชิก", ""), ...members.map((member) => new Option(member.name, member.name)));
  select.value = selectedName;
}

export function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

export function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

export function showToast(message, state) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimeout);
  state.toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

export function formatLongDate(dateString) {
  if (!dateString) return "ไม่ระบุ";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${dateString}T12:00:00`));
}

export function formatShortDate(dateString) {
  if (!dateString) return "ไม่ระบุวัน";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(`${dateString}T12:00:00`));
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  })[character]);
}

export function showFormError(id, message) {
  const error = document.getElementById(id);
  error.textContent = message;
  error.hidden = false;
}

export function clearFormError(id) {
  const error = document.getElementById(id);
  error.textContent = "";
  error.hidden = true;
}
