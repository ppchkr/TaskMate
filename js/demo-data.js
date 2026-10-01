export const statusLabels = {
  pending: "ยังไม่ได้ดำเนินการ",
  "in-progress": "กำลังดำเนินการ",
  done: "เสร็จสิ้น"
};

export const statusIcons = {
  pending: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle></svg>',
  "in-progress": '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v4l3 2"></path></svg>',
  done: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>'
};

export const memberInitials = { "Sarah J.": "S", "Alex M.": "A", "Toby L.": "T", "Kim B.": "K" };
export const memberClasses = { "Sarah J.": "avatar-lilac", "Alex M.": "avatar-peach", "Toby L.": "avatar-blue", "Kim B.": "avatar-lilac" };
export const contacts = [
  { name: "Sarah J.", email: "sarah.jones@university.edu" },
  { name: "Alex M.", email: "alex.martin@university.edu" },
  { name: "Toby L.", email: "toby.lee@university.edu" },
  { name: "Kim B.", email: "kim.brown@university.edu" }
];

const defaultTeam = contacts.map((contact) => ({ ...contact }));

export const projects = [
  {
    id: "midterm",
    name: "Midterm Group Project",
    code: "DTI287",
    color: "symbol-purple",
    deadline: "2026-10-30",
    members: defaultTeam.map((member) => ({ ...member })),
    progress: 65,
    progressCalculated: false,
    tasks: [
      { id: "research-apps", name: "Research Competitor Apps", description: "รวบรวมและวิเคราะห์แอปคู่แข่ง เพื่อหาแนวทางสำหรับโปรเจคของเรา", assignee: "Sarah J.", deadline: "2026-10-12", creator: "Sarah J.", status: "done" },
      { id: "wireframe-sketches", name: "Draft Wireframe Sketches", description: "วางโครงหน้าจอหลักและจัดทำ Wireframe สำหรับแอป", assignee: "Alex M.", deadline: "2026-10-15", creator: "Sarah J.", status: "in-progress" },
      { id: "database-schema", name: "Define Database Schema", description: "ออกแบบโครงสร้างข้อมูลที่จำเป็นสำหรับโปรเจค", assignee: "Toby L.", deadline: "2026-10-18", creator: "Sarah J.", status: "pending" },
      { id: "report-plan", name: "Write Midterm Report Plan", description: "จัดทำโครงร่างรายงานและแบ่งหัวข้อสำหรับสมาชิกในกลุ่ม", assignee: "Kim B.", deadline: "2026-10-20", creator: "Sarah J.", status: "in-progress" },
      { id: "persona-interview", name: "User Persona Interview", description: "สัมภาษณ์ผู้ใช้และสรุปความต้องการของกลุ่มเป้าหมาย", assignee: "Sarah J.", deadline: "2026-10-22", creator: "Sarah J.", status: "pending" }
    ]
  },
  { id: "ai-study", name: "AI Algorithm Study", code: "DTI232", color: "symbol-coral", deadline: "2026-11-12", progress: 20, members: defaultTeam.map((member) => ({ ...member })), tasks: [] },
  { id: "mobile-app", name: "Mobile Application", code: "DTI346", color: "symbol-green", deadline: "2026-11-25", progress: 85, members: defaultTeam.map((member) => ({ ...member })), tasks: [] }
];

export const state = {
  currentScreen: "login-screen",
  currentProjectId: null,
  currentTaskId: null,
  taskFilter: "all",
  editingProjectId: null,
  editingMembers: [],
  editingTask: false,
  history: [],
  toastTimeout: null
};
