import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

/* ---------------------------
  Simple Auth & Data Context
   - stores logged user in localStorage
   - stores demo students, syllabus, quizzes, feedback, specialAttention
----------------------------*/
const AppContext = createContext();
const DATA_KEYS = {
  USER: "acadify_user",
  STUDENTS: "acadify_students",
  SYLLABUS: "acadify_syllabus",
  QUIZZES: "acadify_quizzes",
  FEEDBACK: "acadify_feedback",
  SPECIAL: "acadify_special",
};

const demoStudentNames = [
  "Aarav Mehta","Aditya Sharma","Akash Gupta","Aman Verma","Ananya Rao","Anjali Nair","Arjun Khanna",
  "Bhavana Desai","Chetan Malhotra","Darsh Patel","Devika Iyer","Dhruv Saxena","Divya Joshi","Gaurav Bansal",
  "Harini Reddy","Harsh Kapoor","Ishaan Choudhary","Jatin Arora","Jyoti Menon","Kabir Sethi","Kajal Yadav",
  "Kartik Ahuja","Kavya Kulkarni","Kunal Joshi","Manav Raina","Meera Thomas","Mihir Saxena","Neha Bhatia",
  "Nikhil Sinha","Nisha Paul","Om Prakash","Pallavi Mishra","Pranav Tiwari","Priya Singh","Rahul Jain",
  "Rajesh Kumar","Riya Banerjee","Rohit Agarwal","Sakshi Chauhan","Sameer Khan","Sanjana Pillai","Shreya Ghosh",
  "Siddharth Nair","Sneha Reddy","Soumya Sharma","Tanmay Singh","Tanya Kapoor","Ujjwal Tripathi","Varun Joshi",
  "Yashika Mehta"
];

const defaultSyllabus = {
  "Introduction to Computer Science and Design": [
    { id: "icsd-1", title: "Basics of Computing", completed: false, deadline: null },
    { id: "icsd-2", title: "Design Thinking", completed: false, deadline: null },
  ],
  "Computer Programming": [
    { id: "cp-1", title: "Intro to Programming", completed: true, deadline: null },
    { id: "cp-2", title: "Control Flow", completed: false, deadline: null },
  ],
  "Linear Algebra": [{ id: "la-1", title: "Vectors & Matrices", completed: false, deadline: null }],
  "Cyber World and Security Concern": [{ id: "cy-1", title: "Cyber Basics", completed: false, deadline: null }],
  "Digital Logic Design": [{ id: "dl-1", title: "Boolean Algebra", completed: false, deadline: null }],
  "Language": [{ id: "lang-1", title: "Communication Skills", completed: false, deadline: null }],
};

const demoQuizzes = [
  {
    id: "q1",
    title: "Quiz 1 - Intro to Programming",
    subject: "Computer Programming",
    topicId: "cp-1",
    questions: [
      { q: "What is a variable?", options: ["A container", "A function", "A loop"], answer: 0 },
      { q: "Which is a loop?", options: ["if", "for", "return"], answer: 1 },
    ],
    results: {}, // roll -> score
  },
];

function AppProvider({ children }) {
  // init or load from localStorage
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem(DATA_KEYS.USER);
    return s ? JSON.parse(s) : null;
  });

  useEffect(() => {
    if (!localStorage.getItem(DATA_KEYS.STUDENTS)) {
      const students = demoStudentNames.map((name, i) => ({
        roll: String(100001 + i),
        name,
        email: `${name.split(" ")[0].toLowerCase()}@student.local`,
      }));
      localStorage.setItem(DATA_KEYS.STUDENTS, JSON.stringify(students));
    }
    if (!localStorage.getItem(DATA_KEYS.SYLLABUS)) {
      localStorage.setItem(DATA_KEYS.SYLLABUS, JSON.stringify(defaultSyllabus));
    }
    if (!localStorage.getItem(DATA_KEYS.QUIZZES)) {
      localStorage.setItem(DATA_KEYS.QUIZZES, JSON.stringify(demoQuizzes));
    }
    if (!localStorage.getItem(DATA_KEYS.FEEDBACK)) {
      localStorage.setItem(DATA_KEYS.FEEDBACK, JSON.stringify({})); // roll -> [feedbacks]
    }
    if (!localStorage.getItem(DATA_KEYS.SPECIAL)) {
      localStorage.setItem(DATA_KEYS.SPECIAL, JSON.stringify([]));
    }
  }, []);

  const login = (role, id, password) => {
    // demo credentials:
    // Teachers: T001/password123, T002/password456
    // Students: 100001/studentpass (or pass1001)
    // HOD: H001/hodpass
    if (role === "Teacher" && (id === "T001" && password === "password123" || id === "T002" && password === "password456")) {
      const u = { role, id, name: id === "T001" ? "Dr. Sharma" : "Dr. Khan" };
      setUser(u);
      localStorage.setItem(DATA_KEYS.USER, JSON.stringify(u));
      return { ok: true };
    }
    if (role === "Student") {
      const students = JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || "[]");
      const found = students.find((s) => s.roll === id);
      if (found && (password === "studentpass" || password === "pass" + id.slice(1))) {
        const u = { role, id, name: found.name };
        setUser(u);
        localStorage.setItem(DATA_KEYS.USER, JSON.stringify(u));
        return { ok: true };
      }
    }
    if (role === "HOD" && id === "H001" && password === "hodpass") {
      const u = { role, id, name: "HOD - Dept" };
      setUser(u);
      localStorage.setItem(DATA_KEYS.USER, JSON.stringify(u));
      return { ok: true };
    }
    return { ok: false, msg: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(DATA_KEYS.USER);
  };

  const value = { user, login, logout };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
const useApp = () => useContext(AppContext);

/* ---------------------------
  Small UI components
----------------------------*/
function Header({ title }) {
  const { user, logout } = useApp();
  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <div className="title">Acadify</div>
          <div className="subtitle">Accountability for learning</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && <div className="muted">Logged in as <strong>{user.name}</strong> ({user.role})</div>}
        {user && <button className="btn ghost" onClick={logout}>Logout</button>}
      </div>
    </header>
  );
}

function Sidebar({ role }) {
  // links vary by role
  const teacherLinks = [
    { to: "/teacher/dashboard", label: "Dashboard" },
    { to: "/teacher/syllabus", label: "Syllabus" },
    { to: "/teacher/quizzes", label: "Quizzes" },
    { to: "/teacher/students", label: "Students" },
    { to: "/teacher/report", label: "Reports" },
    { to: "/teacher/profile", label: "Profile" },
  ];
  const studentLinks = [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/student/syllabus", label: "Syllabus" },
    { to: "/student/quizzes", label: "Quizzes" },
    { to: "/student/feedback", label: "Feedback" },
    { to: "/student/profile", label: "Profile" },
  ];
  const hodLinks = [
    { to: "/hod/dashboard", label: "Dashboard" },
    { to: "/hod/overview", label: "Overview" },
    { to: "/hod/faculty", label: "Faculty Reports" },
    { to: "/hod/syllabus-progress", label: "Syllabus Progress" },
  ];

  const links = role === "Teacher" ? teacherLinks : role === "Student" ? studentLinks : hodLinks;

  return (
    <nav className="sidebar" aria-label="Main Navigation">
      <ul className="navlist">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------------------
  Login Page
----------------------------*/
function LoginPage() {
  const { login } = useApp();
  const [role, setRole] = useState("Student");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  function submit(e) {
    e.preventDefault();
    const res = login(role, id.trim(), pw);
    if (!res.ok) {
      setErr(res.msg || "Login failed");
      return;
    }
    if (role === "Teacher") nav("/teacher/dashboard");
    if (role === "Student") nav("/student/dashboard");
    if (role === "HOD") nav("/hod/dashboard");
  }

  return (
    <div className="pagecenter">
      <div className="card formcard">
        <h2>Acadify — Login</h2>
        {err && <div className="error">{err}</div>}

        <form onSubmit={submit}>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option>Student</option>
            <option>Teacher</option>
            <option>HOD</option>
          </select>

          <label>User ID</label>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder="e.g. 100001 or T001" />

          <label>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="password" />

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button className="btn" type="submit">Login</button>
            <button type="button" className="btn ghost" onClick={() => { setId(""); setPw(""); setErr(""); }}>Clear</button>
          </div>
        </form>

        <p className="note" style={{ marginTop: 12 }}>
          Demo credentials:
          <br /> Teacher: <strong>T001 / password123</strong> (or T002/password456)
          <br /> Student: <strong>100001 / studentpass</strong>
          <br /> HOD: <strong>H001 / hodpass</strong>
        </p>
      </div>
    </div>
  );
}

/* ---------------------------
  Student Pages
----------------------------*/
function StudentDashboard() {
  const nav = useNavigate();
  const students = JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || "[]");
  const { user } = useApp();

  // get basic progress from syllabus (mock)
  const syllabus = JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}");
  const subjectProgress = Object.keys(syllabus).map((s) => {
    const topics = syllabus[s];
    const total = topics.length;
    const done = topics.filter((t) => t.completed).length;
    return { subject: s, pct: Math.round((done / total) * 100) || 0 };
  });

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Student" />
        <main className="main">
          <h2>Welcome, {user?.name || "Student"}</h2>

          <div className="grid">
            <div className="card">
              <h3>My Syllabus Progress</h3>
              {subjectProgress.map((p) => (
                <div key={p.subject} style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{p.subject}</div>
                    <div className="muted">{p.pct}%</div>
                  </div>
                  <div className="progress"><i style={{ width: `${p.pct}%` }}></i></div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Today</h3>
              <p>Rate today's class and leave suggestions.</p>
              <Link to="/student/feedback" className="btn small">Give Feedback</Link>
            </div>

            <div className="card">
              <h3>Quizzes Available</h3>
              <p>Take quizzes uploaded by teachers.</p>
              <Link to="/student/quizzes" className="btn small">Go to Quizzes</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StudentSyllabus() {
  const syllabus = JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}");
  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Student" />
        <main className="main">
          <h2>Syllabus (Student view)</h2>
          {Object.keys(syllabus).map((sub) => (
            <div key={sub} className="card">
              <h3>{sub}</h3>
              <ul>
                {syllabus[sub].map((t) => (
                  <li key={t.id} style={{ marginTop: 8 }}>
                    <strong>{t.title}</strong> {t.completed ? <span className="badge">Done</span> : null}
                    <div className="small muted">{t.deadline ? "Deadline: " + t.deadline : ""}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]"));
  const [taking, setTaking] = useState(null); // quiz object
  const [answers, setAnswers] = useState({});
  const { user } = useApp();
  const refresh = () => setQuizzes(JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]"));

  function startQuiz(q) {
    setTaking(q);
    setAnswers({});
  }
  function submitQuiz() {
    if (!taking) return;
    let correct = 0;
    taking.questions.forEach((ques, i) => {
      if (answers[i] !== undefined && Number(answers[i]) === ques.answer) correct++;
    });
    const score = Math.round((correct / taking.questions.length) * 100);
    // save result
    const all = JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]");
    const idx = all.findIndex((x) => x.id === taking.id);
    if (idx >= 0) {
      all[idx].results = all[idx].results || {};
      all[idx].results[user.id] = score;
      localStorage.setItem(DATA_KEYS.QUIZZES, JSON.stringify(all));
      refresh();
      alert("Quiz submitted — score: " + score + "%");
      setTaking(null);
    }
  }

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Student" />
        <main className="main">
          <h2>Quizzes</h2>
          {!taking && quizzes.length === 0 && <div className="card">No quizzes available.</div>}
          {!taking && quizzes.map((q) => (
            <div key={q.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{q.title}</strong>
                  <div className="small muted">{q.subject} — Topic ID: {q.topicId}</div>
                </div>
                <div className="tools">
                  <button className="btn small" onClick={() => startQuiz(q)}>Take</button>
                </div>
              </div>
            </div>
          ))}

          {taking && (
            <div className="card">
              <h3>{taking.title}</h3>
              {taking.questions.map((ques, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                  <div><strong>{i + 1}. {ques.q}</strong></div>
                  <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                    {ques.options.map((opt, oi) => (
                      <label key={oi} style={{ display: "block" }}>
                        <input
                          type="radio"
                          name={"q" + i}
                          value={oi}
                          checked={Number(answers[i]) === oi}
                          onChange={() => setAnswers({ ...answers, [i]: oi })}
                        />{" "}
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={submitQuiz}>Submit Quiz</button>{" "}
                <button className="btn ghost" onClick={() => setTaking(null)}>Cancel</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function StudentFeedback() {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const { user } = useApp();
  function submit() {
    const feedback = JSON.parse(localStorage.getItem(DATA_KEYS.FEEDBACK) || "{}");
    feedback[user.id] = feedback[user.id] || [];
    feedback[user.id].push({ date: new Date().toISOString(), rating, text });
    localStorage.setItem(DATA_KEYS.FEEDBACK, JSON.stringify(feedback));
    alert("Feedback submitted — thanks!");
    setText("");
    setRating(5);
  }
  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Student" />
        <main className="main">
          <h2>Give Feedback</h2>
          <div className="card">
            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Very Poor</option>
            </select>
            <label>Suggestions</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write suggestions..." />
            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={submit}>Submit Feedback</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------
  Teacher Pages
----------------------------*/
function TeacherDashboard() {
  const { user } = useApp();
  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Teacher" />
        <main className="main">
          <h2>Welcome, {user?.name}</h2>
          <div className="grid">
            <div className="card">
              <h3>Syllabus Management</h3>
              <p>Manage topics, set deadlines, mark complete.</p>
              <Link to="/teacher/syllabus" className="btn small">Open</Link>
            </div>
            <div className="card">
              <h3>Quiz Management</h3>
              <p>Create quizzes only after marking topics complete.</p>
              <Link to="/teacher/quizzes" className="btn small">Open</Link>
            </div>
            <div className="card">
              <h3>Student Monitoring</h3>
              <p>View students & mark special attention.</p>
              <Link to="/teacher/students" className="btn small">Open</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function TeacherSyllabus() {
  const [syllabus, setSyllabus] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}"));
  const [subject, setSubject] = useState(Object.keys(syllabus)[0] || "");
  const [newTopic, setNewTopic] = useState("");
  useEffect(() => setSyllabus(JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}")), []);

  function addTopic() {
    if (!newTopic.trim()) return alert("Enter topic title");
    const sid = subject;
    const list = syllabus[sid] || [];
    list.push({ id: sid + "-" + Date.now(), title: newTopic.trim(), completed: false, deadline: null });
    const ns = { ...syllabus, [sid]: list };
    localStorage.setItem(DATA_KEYS.SYLLABUS, JSON.stringify(ns));
    setSyllabus(ns);
    setNewTopic("");
  }
  function toggleComplete(sub, id) {
    const ns = { ...syllabus };
    ns[sub] = ns[sub].map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    localStorage.setItem(DATA_KEYS.SYLLABUS, JSON.stringify(ns));
    setSyllabus(ns);
  }
  function setDeadline(sub, id, val) {
    const ns = { ...syllabus };
    ns[sub] = ns[sub].map((t) => (t.id === id ? { ...t, deadline: val } : t));
    localStorage.setItem(DATA_KEYS.SYLLABUS, JSON.stringify(ns));
    setSyllabus(ns);
  }
  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Teacher" />
        <main className="main">
          <h2>Syllabus Management</h2>
          <div className="card">
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {Object.keys(syllabus).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>New Topic</label>
            <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g. Unit 4 - Recursion" />
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={addTopic}>Add Topic</button>
            </div>
          </div>

          {Object.keys(syllabus).map((sub) => (
            <div key={sub} className="card" style={{ marginTop: 12 }}>
              <h3>{sub}</h3>
              {syllabus[sub].map((t) => (
                <div key={t.id} className="row" style={{ marginTop: 8 }}>
                  <div>
                    <strong>{t.title}</strong>
                    <div className="small muted">{t.deadline ? "Deadline: " + t.deadline : ""}</div>
                  </div>
                  <div className="tools">
                    <input type="date" value={t.deadline || ""} onChange={(e) => setDeadline(sub, t.id, e.target.value)} />
                    <button className="btn small" onClick={() => toggleComplete(sub, t.id)}>{t.completed ? "Mark Incomplete" : "Mark Completed"}</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

function TeacherQuizzes() {
  const [quizzes, setQuizzes] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]"));
  const [syllabus] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}"));
  const [form, setForm] = useState({ title: "", subject: Object.keys(syllabus)[0] || "", topicId: "", questions: [] });

  function addQuestion() {
    setForm({ ...form, questions: [...form.questions, { q: "", options: ["", ""], answer: 0 }] });
  }
  function saveQuiz() {
    // only allow if topic completed
    const topics = syllabus[form.subject] || [];
    const topic = topics.find((t) => t.id === form.topicId);
    if (!topic) return alert("Pick a valid topic");
    if (!topic.completed) return alert("Topic not marked completed — cannot upload quiz.");
    const all = JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]");
    const newQ = { ...form, id: "q" + Date.now(), results: {} };
    all.push(newQ);
    localStorage.setItem(DATA_KEYS.QUIZZES, JSON.stringify(all));
    setQuizzes(all);
    alert("Quiz saved");
    setForm({ title: "", subject: Object.keys(syllabus)[0] || "", topicId: "", questions: [] });
  }

  function updateQuestion(idx, key, val) {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [key]: val };
    setForm({ ...form, questions: qs });
  }

  function updateOption(qi, oi, val) {
    const qs = [...form.questions];
    const options = [...qs[qi].options];
    options[oi] = val;
    qs[qi].options = options;
    setForm({ ...form, questions: qs });
  }

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Teacher" />
        <main className="main">
          <h2>Quiz Management</h2>
          <div className="card">
            <label>Quiz Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <label>Subject</label>
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, topicId: "" })}>
              {Object.keys(syllabus).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>Topic</label>
            <select value={form.topicId} onChange={(e) => setForm({ ...form, topicId: e.target.value })}>
              <option value="">-- select topic --</option>
              {(syllabus[form.subject] || []).map((t) => <option key={t.id} value={t.id}>{t.title} {t.completed ? "(Done)" : ""}</option>)}
            </select>

            <div style={{ marginTop: 10 }}>
              <button className="btn" onClick={addQuestion}>Add Question</button>
            </div>
          </div>

          {form.questions.map((q, i) => (
            <div key={i} className="card" style={{ marginTop: 8 }}>
              <label>Q{i + 1}</label>
              <input value={q.q} onChange={(e) => updateQuestion(i, "q", e.target.value)} placeholder="Question text" />
              <div style={{ display: "flex", gap: 8 }}>
                <input value={q.options[0]} onChange={(e) => updateOption(i, 0, e.target.value)} placeholder="Option A" />
                <input value={q.options[1]} onChange={(e) => updateOption(i, 1, e.target.value)} placeholder="Option B" />
                {q.options[2] !== undefined ? <input value={q.options[2]} onChange={(e) => updateOption(i, 2, e.target.value)} placeholder="Option C" /> : null}
              </div>
              <label>Correct Option (index)</label>
              <input type="number" min={0} value={q.answer} onChange={(e) => updateQuestion(i, "answer", Number(e.target.value))} />
            </div>
          ))}

          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={saveQuiz}>Save Quiz</button>
          </div>

          <h3 style={{ marginTop: 18 }}>Existing Quizzes</h3>
          {(quizzes || []).map((qq) => (
            <div key={qq.id} className="card" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{qq.title}</strong>
                  <div className="small muted">{qq.subject}</div>
                </div>
                <div className="tools">
                  <Link to={`/teacher/report?quiz=${qq.id}`} className="btn small ghost">View Results</Link>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

function TeacherStudents() {
  const [students, setStudents] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || "[]"));
  const [special, setSpecial] = useState(JSON.parse(localStorage.getItem(DATA_KEYS.SPECIAL) || "[]"));

  function toggleSpecial(roll) {
    let s = JSON.parse(localStorage.getItem(DATA_KEYS.SPECIAL) || "[]");
    if (s.includes(roll)) s = s.filter((r) => r !== roll);
    else s.push(roll);
    localStorage.setItem(DATA_KEYS.SPECIAL, JSON.stringify(s));
    setSpecial(s);
  }

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Teacher" />
        <main className="main">
          <h2>Students</h2>
          {students.map((st) => (
            <div key={st.roll} className="row">
              <div>
                <strong>{st.name}</strong> <span className="muted">({st.roll})</span>
                <div className="small muted">{st.email}</div>
              </div>
              <div className="tools">
                <Link to={`/student/${st.roll}`} className="btn small ghost">Profile</Link>
                <button className="btn small" onClick={() => toggleSpecial(st.roll)}>{special.includes(st.roll) ? "Unmark" : "Mark Special"}</button>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------
  HOD Pages
----------------------------*/
function HodDashboard() {
  const students = JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || "[]");
  const syllabus = JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}");
  const special = JSON.parse(localStorage.getItem(DATA_KEYS.SPECIAL) || "[]");

  const subjectProgress = Object.keys(syllabus).map((s) => {
    const topics = syllabus[s];
    const total = topics.length;
    const done = topics.filter((t) => t.completed).length;
    return { subject: s, pct: Math.round((done / total) * 100) || 0 };
  });

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="HOD" />
        <main className="main">
          <h2>HOD Dashboard</h2>

          <div className="grid">
            <div className="card">
              <h3>Overall Syllabus Progress</h3>
              {subjectProgress.map((p) => (
                <div key={p.subject} style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{p.subject}</div>
                    <div className="muted">{p.pct}%</div>
                  </div>
                  <div className="progress"><i style={{ width: `${p.pct}%` }}></i></div>
                </div>
              ))}
            </div>

            <div className="card">
              <h3>Special Attention Students</h3>
              <div className="small muted">Count: {special.length}</div>
              <ul>
                {special.map((r) => <li key={r}>{r}</li>)}
                {special.length === 0 && <li className="muted">None</li>}
              </ul>
            </div>

            <div className="card">
              <h3>Class Strength</h3>
              <div className="muted">Students: {students.length}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------
  Student profile (both teacher/hod can open; students have own profile)
----------------------------*/
function StudentProfile() {
  const { roll } = useParams();
  const students = JSON.parse(localStorage.getItem(DATA_KEYS.STUDENTS) || "[]");
  const st = students.find((s) => s.roll === roll) || students.find((s) => s.roll === (JSON.parse(localStorage.getItem(DATA_KEYS.USER) || "{}").id));
  if (!st) return <div className="page"><Header /><div className="pagecenter"><div className="card">Student not found</div></div></div>;

  const syllabus = JSON.parse(localStorage.getItem(DATA_KEYS.SYLLABUS) || "{}");
  const feedback = JSON.parse(localStorage.getItem(DATA_KEYS.FEEDBACK) || "{}");
  const quizzes = JSON.parse(localStorage.getItem(DATA_KEYS.QUIZZES) || "[]");

  // compute mock attendance & progress
  const attendance = Math.floor(70 + Math.random() * 30);
  const progress = Object.keys(syllabus).map((s) => {
    const topics = syllabus[s];
    const done = topics.filter((t) => t.completed).length;
    return { subject: s, pct: Math.round((done / topics.length) * 100) || 0 };
  });

  return (
    <div className="page">
      <Header />
      <div className="shell">
        <Sidebar role="Teacher" />
        <main className="main">
          <h2>{st.name} — {st.roll}</h2>
          <div className="card">
            <div><strong>Attendance:</strong> {attendance}%</div>
            <div style={{ marginTop: 8 }}>
              <strong>Progress</strong>
              {progress.map((p) => (
                <div key={p.subject} style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>{p.subject}</div>
                    <div className="muted">{p.pct}%</div>
                  </div>
                  <div className="progress"><i style={{ width: `${p.pct}%` }}></i></div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <h3>Feedback (latest)</h3>
            {(feedback[st.roll] || []).slice(-3).reverse().map((f, i) => (
              <div key={i} className="row" style={{ marginTop: 8 }}>
                <div>
                  <div className="small muted">{new Date(f.date).toLocaleString()}</div>
                  <div>Rating: {f.rating} — {f.text}</div>
                </div>
              </div>
            ))}
            {(feedback[st.roll] || []).length === 0 && <div className="muted">No feedback yet</div>}
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <h3>Quiz Results (sample)</h3>
            <table className="table">
              <thead><tr><th>Quiz</th><th>Score</th></tr></thead>
              <tbody>
                {quizzes.map((q) => <tr key={q.id}><td>{q.title}</td><td>{(q.results && q.results[st.roll]) || "—"}</td></tr>)}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------
  Misc / NotFound
----------------------------*/
function NotFound() {
  return (
    <div className="pagecenter">
      <div className="card">
        <h2>404 — Not Found</h2>
        <p>Page does not exist.</p>
        <Link to="/login" className="btn">Go to Login</Link>
      </div>
    </div>
  );
}

/* ---------------------------
  Main App / Router
----------------------------*/
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student routes */}
          <Route path="/student/dashboard" element={<Protected role="Student"><StudentDashboard /></Protected>} />
          <Route path="/student/syllabus" element={<Protected role="Student"><StudentSyllabus /></Protected>} />
          <Route path="/student/quizzes" element={<Protected role="Student"><StudentQuizzes /></Protected>} />
          <Route path="/student/feedback" element={<Protected role="Student"><StudentFeedback /></Protected>} />
          <Route path="/student/profile" element={<Protected role="Student"><StudentProfile /></Protected>} />

          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={<Protected role="Teacher"><TeacherDashboard /></Protected>} />
          <Route path="/teacher/syllabus" element={<Protected role="Teacher"><TeacherSyllabus /></Protected>} />
          <Route path="/teacher/quizzes" element={<Protected role="Teacher"><TeacherQuizzes /></Protected>} />
          <Route path="/teacher/students" element={<Protected role="Teacher"><TeacherStudents /></Protected>} />
          <Route path="/teacher/profile" element={<Protected role="Teacher"><div className="page"><Header /><div className="shell"><Sidebar role="Teacher" /><main className="main"><div className="card"><h2>Teacher Profile</h2><p>Editable profile soon.</p></div></main></div></div></Protected>} />

          {/* HOD routes */}
          <Route path="/hod/dashboard" element={<Protected role="HOD"><HodDashboard /></Protected>} />
          <Route path="/hod/overview" element={<Protected role="HOD"><HodDashboard /></Protected>} />
          <Route path="/hod/faculty" element={<Protected role="HOD"><HodDashboard /></Protected>} />
          <Route path="/hod/syllabus-progress" element={<Protected role="HOD"><HodDashboard /></Protected>} />

          {/* Student profile by roll (teacher/hod) */}
          <Route path="/student/:roll" element={<Protected><StudentProfile /></Protected>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

/* Protected wrapper checks user role */
function Protected({ children, role }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <div className="pagecenter"><div className="card"><h3>Access denied</h3><p>You are logged in as {user.role}</p><Link to="/login" className="btn">Go to Login</Link></div></div>;
  return children;
}

/* small Link component alias for style */
function LinkButton({ to, children }) {
  return <Link to={to} className="btn">{children}</Link>;
}
