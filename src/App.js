import { useState, useEffect, useCallback } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Utility ────────────────────────────────────────────────────────────────
const LS = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};

const uid = () => Math.random().toString(36).slice(2, 9);

const GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

const PALETTE = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

// ─── Theme ───────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0f1117",
    surface: "#1a1d2e",
    card: "#21243d",
    border: "#2e3255",
    text: "#e8eaf6",
    muted: "#8b8fa8",
    accent: "#6366f1",
    accentSoft: "#6366f122",
  },
  light: {
    bg: "#f0f2ff",
    surface: "#ffffff",
    card: "#ffffff",
    border: "#d4d8f0",
    text: "#1a1d2e",
    muted: "#6b7280",
    accent: "#4f46e5",
    accentSoft: "#4f46e511",
  },
};

// ─── Styles helper ──────────────────────────────────────────────────────────
const injectCSS = (dark) => {
  const t = dark ? THEMES.dark : THEMES.light;
  const id = "spdash-vars";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `
    :root {
      --bg: ${t.bg}; --surface: ${t.surface}; --card: ${t.card};
      --border: ${t.border}; --text: ${t.text}; --muted: ${t.muted};
      --accent: ${t.accent}; --accent-soft: ${t.accentSoft};
      --font-head: 'Sora', sans-serif; --font-body: 'DM Sans', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: var(--font-body); }
    ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pop    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    .fade-up { animation: fadeUp .35s ease both; }
    input, select { outline: none; }
    input[type=checkbox] { accent-color: var(--accent); width:16px; height:16px; cursor:pointer; }
  `;
  // Load Google Fonts once
  if (!document.getElementById("spdash-fonts")) {
    const lnk = document.createElement("link");
    lnk.id = "spdash-fonts";
    lnk.rel = "stylesheet";
    lnk.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
    document.head.appendChild(lnk);
  }
};

// ─── Shared Components ───────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "20px 22px",
      boxShadow: "0 2px 16px #0002",
      ...style,
    }}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "var(--accent)" }) => (
  <span
    style={{
      background: color + "22",
      color,
      borderRadius: 99,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "var(--font-body)",
    }}
  >
    {children}
  </span>
);

const Btn = ({
  children,
  onClick,
  variant = "solid",
  style = {},
  disabled,
}) => {
  const base = {
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 10,
    fontWeight: 600,
    fontFamily: "var(--font-body)",
    fontSize: 14,
    transition: "all .18s",
    border: "none",
    opacity: disabled ? 0.5 : 1,
    padding: "8px 18px",
    ...style,
  };
  const solid = { background: "var(--accent)", color: "#fff", ...base };
  const ghost = {
    background: "transparent",
    color: "var(--accent)",
    border: "1.5px solid var(--accent)",
    ...base,
  };
  const danger = {
    background: "#ef444422",
    color: "#ef4444",
    border: "1.5px solid #ef444433",
    ...base,
  };
  const map = { solid, ghost, danger };
  return (
    <button style={map[variant] || solid} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = "text", style = {} }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      color: "var(--text)",
      borderRadius: 10,
      padding: "8px 14px",
      fontSize: 14,
      fontFamily: "var(--font-body)",
      width: "100%",
      transition: "border .15s",
      ...style,
    }}
    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
  />
);

const Select = ({ value, onChange, options, style = {} }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      background: "var(--surface)",
      border: "1.5px solid var(--border)",
      color: "var(--text)",
      borderRadius: 10,
      padding: "8px 14px",
      fontSize: 14,
      fontFamily: "var(--font-body)",
      cursor: "pointer",
      ...style,
    }}
  >
    {options.map((o) => (
      <option key={o.value ?? o} value={o.value ?? o}>
        {o.label ?? o}
      </option>
    ))}
  </select>
);

const SectionTitle = ({ children }) => (
  <h2
    style={{
      fontFamily: "var(--font-head)",
      fontSize: 18,
      fontWeight: 700,
      marginBottom: 18,
      color: "var(--text)",
    }}
  >
    {children}
  </h2>
);

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "⊞" },
  { id: "subjects", label: "Subjects", icon: "📚" },
  { id: "tasks", label: "Tasks", icon: "✅" },
  { id: "attendance", label: "Attendance", icon: "📅" },
  { id: "gpa", label: "GPA", icon: "🎓" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Overview({ subjects, tasks, attendance, gpa }) {
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const attPct = subjects.map((s) => {
    const recs = attendance.filter((a) => a.subjectId === s.id);
    const present = recs.filter((a) => a.status === "present").length;
    return {
      subject: s.name.substring(0, 8),
      value: recs.length ? Math.round((present / recs.length) * 100) : 0,
      color: s.color,
    };
  });

  const statsCards = [
    { label: "Subjects", value: subjects.length, icon: "📚", color: "#6366f1" },
    {
      label: "Tasks Done",
      value: `${done}/${total}`,
      icon: "✅",
      color: "#10b981",
    },
    {
      label: "Avg Attendance",
      value: attPct.length
        ? Math.round(attPct.reduce((a, b) => a + b.value, 0) / attPct.length) +
          "%"
        : "—",
      icon: "📅",
      color: "#f59e0b",
    },
    { label: "Current GPA", value: gpa ?? "—", icon: "🎓", color: "#ef4444" },
  ];

  return (
    <div className="fade-up">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {statsCards.map((s, i) => (
          <Card key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>{s.icon}</div>
            <div
              style={{
                fontFamily: "var(--font-head)",
                fontSize: 28,
                fontWeight: 800,
                color: s.color,
                marginTop: 4,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle>Task Progress</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                position: "relative",
                width: 100,
                height: 100,
                flexShrink: 0,
              }}
            >
              <svg
                viewBox="0 0 36 36"
                style={{ transform: "rotate(-90deg)", width: 100, height: 100 }}
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray .5s" }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-head)",
                  fontWeight: 800,
                  fontSize: 18,
                  color: "var(--accent)",
                }}
              >
                {pct}%
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {done} completed
              </div>
              <div
                style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}
              >
                {total - done} remaining
              </div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {tasks
                  .filter((t) => !t.done)
                  .slice(0, 3)
                  .map((t) => (
                    <div
                      key={t.id}
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent)",
                          flexShrink: 0,
                          display: "inline-block",
                        }}
                      />
                      {t.title}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle>Attendance by Subject</SectionTitle>
          {attPct.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              No attendance data yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={attPct}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="subject"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                  }}
                  formatter={(v) => v + "%"}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {attPct.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUBJECTS
// ═══════════════════════════════════════════════════════════════════════════════
function Subjects({ subjects, setSubjects }) {
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [credits, setCredits] = useState("3");

  const add = () => {
    if (!name.trim()) return;
    const s = {
      id: uid(),
      name: name.trim(),
      teacher: teacher.trim(),
      credits: Number(credits),
      color: PALETTE[subjects.length % PALETTE.length],
    };
    setSubjects((prev) => [...prev, s]);
    setName("");
    setTeacher("");
    setCredits("3");
  };

  const remove = (id) => setSubjects((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="fade-up">
      <SectionTitle>Manage Subjects</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Subject Name *
            </label>
            <Input
              value={name}
              onChange={setName}
              placeholder="e.g. Mathematics"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Teacher
            </label>
            <Input
              value={teacher}
              onChange={setTeacher}
              placeholder="e.g. Mr. Ahmed"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Credits
            </label>
            <Input
              value={credits}
              onChange={setCredits}
              type="number"
              style={{ width: 80 }}
            />
          </div>
          <Btn onClick={add}>+ Add</Btn>
        </div>
      </Card>

      {subjects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px 0",
            color: "var(--muted)",
          }}
        >
          No subjects yet. Add your first one!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 14,
          }}
        >
          {subjects.map((s) => (
            <Card key={s.id} style={{ borderLeft: `4px solid ${s.color}` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-head)",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {s.name}
                  </div>
                  {s.teacher && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        marginTop: 3,
                      }}
                    >
                      👤 {s.teacher}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Badge color={s.color}>{s.credits} credits</Badge>
                  </div>
                </div>
                <Btn
                  variant="danger"
                  onClick={() => remove(s.id)}
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  ✕
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════
const PRIORITY_META = {
  high: { label: "High", color: "#ef4444" },
  medium: { label: "Medium", color: "#f59e0b" },
  low: { label: "Low", color: "#10b981" },
};

function Tasks({ tasks, setTasks, subjects }) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");

  const add = () => {
    if (!title.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        title: title.trim(),
        subjectId,
        due,
        priority,
        done: false,
        createdAt: Date.now(),
      },
    ]);
    setTitle("");
    setDue("");
  };

  const toggle = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const visible = tasks
    .filter((t) => {
      if (filter === "active") return !t.done;
      if (filter === "done") return t.done;
      return true;
    })
    .sort((a, b) => {
      const po = { high: 0, medium: 1, low: 2 };
      return po[a.priority] - po[b.priority] || a.done - b.done;
    });

  const subOpts = [
    { value: "", label: "No Subject" },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="fade-up">
      <SectionTitle>Task Manager</SectionTitle>
      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto auto",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Task *
            </label>
            <Input
              value={title}
              onChange={setTitle}
              placeholder="e.g. Study Chapter 4"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Subject
            </label>
            <Select
              value={subjectId}
              onChange={setSubjectId}
              options={subOpts}
              style={{ width: 140 }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Due
            </label>
            <Input
              value={due}
              onChange={setDue}
              type="date"
              style={{ width: 150 }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Priority
            </label>
            <Select
              value={priority}
              onChange={setPriority}
              options={["high", "medium", "low"].map((p) => ({
                value: p,
                label: PRIORITY_META[p].label,
              }))}
              style={{ width: 110 }}
            />
          </div>
          <Btn onClick={add}>+ Add</Btn>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "active", "done"].map((f) => (
          <Btn
            key={f}
            variant={filter === f ? "solid" : "ghost"}
            onClick={() => setFilter(f)}
            style={{ padding: "6px 16px", textTransform: "capitalize" }}
          >
            {f}
          </Btn>
        ))}
        <span
          style={{
            marginLeft: "auto",
            fontSize: 13,
            color: "var(--muted)",
            alignSelf: "center",
          }}
        >
          {tasks.filter((t) => t.done).length}/{tasks.length} completed
        </span>
      </div>

      {visible.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px 0",
            color: "var(--muted)",
          }}
        >
          No tasks here.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((t) => {
            const sub = subjects.find((s) => s.id === t.subjectId);
            const pm = PRIORITY_META[t.priority];
            const overdue = t.due && !t.done && new Date(t.due) < new Date();
            return (
              <Card
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: t.done ? 0.55 : 1,
                  borderLeft: `4px solid ${sub?.color || "var(--border)"}`,
                  padding: "14px 18px",
                }}
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggle(t.id)}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      textDecoration: t.done ? "line-through" : "none",
                      fontSize: 15,
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 4,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {sub && <Badge color={sub.color}>{sub.name}</Badge>}
                    <Badge color={pm.color}>{pm.label}</Badge>
                    {t.due && (
                      <span
                        style={{
                          fontSize: 12,
                          color: overdue ? "#ef4444" : "var(--muted)",
                        }}
                      >
                        {overdue ? "⚠ " : "📅 "}
                        {t.due}
                      </span>
                    )}
                  </div>
                </div>
                <Btn
                  variant="danger"
                  onClick={() => remove(t.id)}
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  ✕
                </Btn>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════
function Attendance({ attendance, setAttendance, subjects }) {
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState("present");
  const [filterSub, setFilterSub] = useState("all");

  const add = () => {
    if (!subjectId || !date) return;
    const exists = attendance.find(
      (a) => a.subjectId === subjectId && a.date === date
    );
    if (exists) {
      setAttendance((prev) =>
        prev.map((a) => (a.id === exists.id ? { ...a, status } : a))
      );
      return;
    }
    setAttendance((prev) => [...prev, { id: uid(), subjectId, date, status }]);
  };

  const remove = (id) =>
    setAttendance((prev) => prev.filter((a) => a.id !== id));

  const subOpts = subjects.length
    ? subjects.map((s) => ({ value: s.id, label: s.name }))
    : [];
  const filterOpts = [{ value: "all", label: "All Subjects" }, ...subOpts];

  const visible = attendance
    .filter((a) => filterSub === "all" || a.subjectId === filterSub)
    .sort((a, b) => b.date.localeCompare(a.date));

  const statsPerSub = subjects.map((s) => {
    const recs = attendance.filter((a) => a.subjectId === s.id);
    const present = recs.filter((a) => a.status === "present").length;
    const absent = recs.filter((a) => a.status === "absent").length;
    const late = recs.filter((a) => a.status === "late").length;
    const pct = recs.length ? ((present / recs.length) * 100).toFixed(1) : null;
    return { ...s, recs: recs.length, present, absent, late, pct };
  });

  const statusColor = {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
  };

  return (
    <div className="fade-up">
      <SectionTitle>Attendance Tracker</SectionTitle>

      {subjects.length === 0 ? (
        <Card>
          <p style={{ color: "var(--muted)" }}>
            Add subjects first to track attendance.
          </p>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 10,
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={setSubjectId}
                  options={[{ value: "", label: "Select..." }, ...subOpts]}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Date
                </label>
                <Input
                  value={date}
                  onChange={setDate}
                  type="date"
                  style={{ width: 160 }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Status
                </label>
                <Select
                  value={status}
                  onChange={setStatus}
                  options={["present", "absent", "late"].map((s) => ({
                    value: s,
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                  }))}
                  style={{ width: 120 }}
                />
              </div>
              <Btn onClick={add} disabled={!subjectId}>
                Mark
              </Btn>
            </div>
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {statsPerSub.map((s) => (
              <Card key={s.id} style={{ borderTop: `3px solid ${s.color}` }}>
                <div
                  style={{
                    fontFamily: "var(--font-head)",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {s.name}
                </div>
                {s.recs === 0 ? (
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    No records yet
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-head)",
                        fontSize: 26,
                        fontWeight: 800,
                        color: Number(s.pct) >= 75 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {s.pct}%
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      ✅ {s.present} &nbsp;❌ {s.absent} &nbsp;⏰ {s.late}
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Select
              value={filterSub}
              onChange={setFilterSub}
              options={filterOpts}
              style={{ width: 200 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {visible.map((a) => {
              const sub = subjects.find((s) => s.id === a.subjectId);
              return (
                <Card
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "12px 18px",
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: statusColor[a.status],
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{sub?.name || "?"}</span>
                    <span
                      style={{
                        color: "var(--muted)",
                        fontSize: 13,
                        marginLeft: 12,
                      }}
                    >
                      📅 {a.date}
                    </span>
                  </div>
                  <Badge color={statusColor[a.status]}>{a.status}</Badge>
                  <Btn
                    variant="danger"
                    onClick={() => remove(a.id)}
                    style={{ padding: "4px 10px", fontSize: 12 }}
                  >
                    ✕
                  </Btn>
                </Card>
              );
            })}
            {visible.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "var(--muted)",
                }}
              >
                No records yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GPA
// ═══════════════════════════════════════════════════════════════════════════════
function GPA({ subjects, gpaRecords, setGpaRecords }) {
  const [subjectId, setSubjectId] = useState("");
  const [grade, setGrade] = useState("A");
  const [sem, setSem] = useState("1");

  const add = () => {
    if (!subjectId) return;
    const sub = subjects.find((s) => s.id === subjectId);
    const existing = gpaRecords.find(
      (r) => r.subjectId === subjectId && r.sem === sem
    );
    if (existing) {
      setGpaRecords((prev) =>
        prev.map((r) => (r.id === existing.id ? { ...r, grade } : r))
      );
      return;
    }
    setGpaRecords((prev) => [
      ...prev,
      { id: uid(), subjectId, grade, sem, credits: sub?.credits || 3 },
    ]);
  };

  const remove = (id) =>
    setGpaRecords((prev) => prev.filter((r) => r.id !== id));

  const sems = [...new Set(gpaRecords.map((r) => r.sem))].sort();
  const calcGPA = (records) => {
    const total = records.reduce((a, r) => a + r.credits, 0);
    if (!total) return null;
    const pts = records.reduce(
      (a, r) => a + (GRADE_POINTS[r.grade] ?? 0) * r.credits,
      0
    );
    return (pts / total).toFixed(2);
  };

  const overallGPA = calcGPA(gpaRecords);
  const radarData = subjects.map((s) => {
    const r = gpaRecords.find((g) => g.subjectId === s.id);
    return {
      subject: s.name.substring(0, 8),
      value: r ? GRADE_POINTS[r.grade] ?? 0 : 0,
    };
  });

  const subOpts = subjects.length
    ? subjects.map((s) => ({ value: s.id, label: s.name }))
    : [];
  const gradeOpts = Object.keys(GRADE_POINTS).map((g) => ({
    value: g,
    label: g,
  }));
  const semOpts = ["1", "2", "3", "4", "5", "6", "7", "8"].map((s) => ({
    value: s,
    label: `Semester ${s}`,
  }));

  return (
    <div className="fade-up">
      <SectionTitle>GPA Calculator</SectionTitle>

      {subjects.length === 0 ? (
        <Card>
          <p style={{ color: "var(--muted)" }}>
            Add subjects first to calculate GPA.
          </p>
        </Card>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <Card style={{ textAlign: "center" }}>
              <div
                style={{ fontSize: 14, color: "var(--muted)", marginBottom: 4 }}
              >
                Overall GPA
              </div>
              <div
                style={{
                  fontFamily: "var(--font-head)",
                  fontSize: 56,
                  fontWeight: 800,
                  color:
                    overallGPA >= 3.5
                      ? "#10b981"
                      : overallGPA >= 2.5
                      ? "#f59e0b"
                      : overallGPA
                      ? "#ef4444"
                      : "var(--muted)",
                }}
              >
                {overallGPA ?? "—"}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>
                out of 4.0
              </div>
              {overallGPA && (
                <div style={{ marginTop: 8 }}>
                  <Badge
                    color={
                      overallGPA >= 3.5
                        ? "#10b981"
                        : overallGPA >= 2.5
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                  >
                    {overallGPA >= 3.5
                      ? "Distinction"
                      : overallGPA >= 2.5
                      ? "Good Standing"
                      : "Needs Improvement"}
                  </Badge>
                </div>
              )}
            </Card>

            <Card>
              <div
                style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8 }}
              >
                Subject Performance
              </div>
              {radarData.some((r) => r.value > 0) ? (
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: 13,
                    paddingTop: 20,
                  }}
                >
                  Enter grades to see chart.
                </div>
              )}
            </Card>
          </div>

          <Card style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 10,
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Subject *
                </label>
                <Select
                  value={subjectId}
                  onChange={setSubjectId}
                  options={[{ value: "", label: "Select..." }, ...subOpts]}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Grade
                </label>
                <Select
                  value={grade}
                  onChange={setGrade}
                  options={gradeOpts}
                  style={{ width: 90 }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Semester
                </label>
                <Select
                  value={sem}
                  onChange={setSem}
                  options={semOpts}
                  style={{ width: 130 }}
                />
              </div>
              <Btn onClick={add} disabled={!subjectId}>
                Save
              </Btn>
            </div>
          </Card>

          {sems.map((s) => {
            const recs = gpaRecords.filter((r) => r.sem === s);
            const gpa = calcGPA(recs);
            return (
              <div key={s} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{ fontFamily: "var(--font-head)", fontWeight: 700 }}
                  >
                    Semester {s}
                  </span>
                  {gpa && <Badge color="var(--accent)">GPA: {gpa}</Badge>}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {recs.map((r) => {
                    const sub = subjects.find((x) => x.id === r.subjectId);
                    const pts = GRADE_POINTS[r.grade] ?? 0;
                    const col =
                      pts >= 3.5
                        ? "#10b981"
                        : pts >= 2.0
                        ? "#f59e0b"
                        : "#ef4444";
                    return (
                      <Card
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 18px",
                          borderLeft: `4px solid ${
                            sub?.color || "var(--border)"
                          }`,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>
                            {sub?.name || "?"}
                          </span>
                          <span
                            style={{
                              color: "var(--muted)",
                              fontSize: 13,
                              marginLeft: 8,
                            }}
                          >
                            {sub?.credits || 3} credits
                          </span>
                        </div>
                        <Badge color={col}>
                          {r.grade} ({pts})
                        </Badge>
                        <Btn
                          variant="danger"
                          onClick={() => remove(r.id)}
                          style={{ padding: "4px 10px", fontSize: 12 }}
                        >
                          ✕
                        </Btn>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {gpaRecords.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "var(--muted)",
              }}
            >
              No grades entered yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(() => LS.get("spdash-dark", true));
  const [tab, setTab] = useState("overview");
  const [subjects, setSubjects] = useState(() => LS.get("spdash-subjects", []));
  const [tasks, setTasks] = useState(() => LS.get("spdash-tasks", []));
  const [attendance, setAttendance] = useState(() =>
    LS.get("spdash-attendance", [])
  );
  const [gpaRecords, setGpaRecords] = useState(() => LS.get("spdash-gpa", []));
  const [menuOpen, setMenuOpen] = useState(false);

  // Persist
  useEffect(() => {
    LS.set("spdash-dark", dark);
    injectCSS(dark);
  }, [dark]);
  useEffect(() => injectCSS(dark), []);
  useEffect(() => {
    LS.set("spdash-subjects", subjects);
  }, [subjects]);
  useEffect(() => {
    LS.set("spdash-tasks", tasks);
  }, [tasks]);
  useEffect(() => {
    LS.set("spdash-attendance", attendance);
  }, [attendance]);
  useEffect(() => {
    LS.set("spdash-gpa", gpaRecords);
  }, [gpaRecords]);

  const overallGPA = (() => {
    const total = gpaRecords.reduce((a, r) => a + r.credits, 0);
    if (!total) return null;
    return (
      gpaRecords.reduce(
        (a, r) => a + (GRADE_POINTS[r.grade] ?? 0) * r.credits,
        0
      ) / total
    ).toFixed(2);
  })();

  const t = dark ? THEMES.dark : THEMES.light;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "var(--font-body)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP NAV */}
      <header
        style={{
          background: t.surface,
          borderBottom: `1px solid ${t.border}`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 60,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 16px #0003",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontWeight: 800,
            fontSize: 20,
            color: t.accent,
            marginRight: 36,
            letterSpacing: -0.5,
          }}
        >
          🎓 StudyDesk
        </div>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV_ITEMS.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                background: tab === n.id ? t.accentSoft : "transparent",
                color: tab === n.id ? t.accent : t.muted,
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                fontFamily: "var(--font-body)",
                fontWeight: tab === n.id ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                transition: "all .15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => setDark((d) => !d)}
          style={{
            background: t.accentSoft,
            border: "none",
            borderRadius: 10,
            padding: "7px 14px",
            cursor: "pointer",
            fontSize: 18,
            transition: "all .2s",
          }}
          title="Toggle theme"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          width: "100%",
          margin: "0 auto",
          padding: "28px 24px",
        }}
      >
        {tab === "overview" && (
          <Overview
            subjects={subjects}
            tasks={tasks}
            attendance={attendance}
            gpa={overallGPA}
          />
        )}
        {tab === "subjects" && (
          <Subjects subjects={subjects} setSubjects={setSubjects} />
        )}
        {tab === "tasks" && (
          <Tasks tasks={tasks} setTasks={setTasks} subjects={subjects} />
        )}
        {tab === "attendance" && (
          <Attendance
            attendance={attendance}
            setAttendance={setAttendance}
            subjects={subjects}
          />
        )}
        {tab === "gpa" && (
          <GPA
            subjects={subjects}
            gpaRecords={gpaRecords}
            setGpaRecords={setGpaRecords}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: `1px solid ${t.border}`,
          padding: "12px 24px",
          textAlign: "center",
          fontSize: 12,
          color: t.muted,
        }}
      >
        StudyDesk • All data saved locally in your browser
      </footer>
    </div>
  );
}
