
import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const ADMIN_EMAIL = "admin@ailab.edu";
const ADMIN_PASSWORD = "LabAdmin@123";
const today = new Date().toISOString().slice(0, 10);

const starter = [
  {
    id: 101,
    student: "Aarav Sharma",
    studentId: "CS23041",
    email: "aarav@college.edu",
    pc: "AI Lab PC 01",
    date: "2026-11-13",
    start: "10:00",
    end: "11:00",
    project: "Vision-based attendance",
    description: "Testing an image classification model for the project demo.",
    deadline: "2026-11-15",
    status: "Confirmed",
    members: "Aarav, Meera, Rohan"
  },
  {
    id: 102,
    student: "Meera Nair",
    studentId: "CS23018",
    email: "meera@college.edu",
    pc: "AI Lab PC 02",
    date: "2026-11-13",
    start: "12:00",
    end: "13:00",
    project: "Campus Copilot",
    description: "Frontend integration and API testing.",
    deadline: "2026-11-14",
    status: "Pending",
    members: "Meera Nair"
  },
  {
    id: 103,
    student: "Rohan Das",
    studentId: "CS23027",
    email: "rohan@college.edu",
    pc: "AI Lab PC 01",
    date: "2026-11-14",
    start: "14:00",
    end: "15:00",
    project: "Robotics simulation",
    description: "Simulation and debugging.",
    deadline: "2026-11-20",
    status: "Confirmed",
    members: "Rohan, Aarav"
  }
];

const initialWait = [
  {
    id: 201,
    student: "Ishita Rao",
    studentId: "CS23052",
    pc: "AI Lab PC 01",
    date: "2026-11-13",
    start: "10:00",
    end: "11:00",
    project: "Assistive navigation prototype",
    deadline: "2026-11-13",
    joined: "08:42"
  },
  {
    id: 202,
    student: "Dev Menon",
    studentId: "CS23033",
    pc: "AI Lab PC 02",
    date: "2026-11-13",
    start: "12:00",
    end: "13:00",
    project: "Edge AI performance study",
    deadline: "2026-11-18",
    joined: "09:05"
  }
];

const pcNames = ["AI Lab PC 01", "AI Lab PC 02"];

const read = (key, fallback) => {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const readArray = (key, fallback) => {
  const value = read(key, fallback);
  return Array.isArray(value) ? value : fallback;
};

function Tag({ children }) {
  return (
    <span className={"tag " + String(children).toLowerCase().replaceAll(" ", "-")}>
      {children}
    </span>
  );
}

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [admin, setAdmin] = useState(read("lab_admin", null));
  const [page, setPage] = useState("Overview");

  const [bookings, setBookings] = useState(() =>
    readArray("lab_bookings", starter)
  );

  const [waiting, setWaiting] = useState(() =>
    readArray("lab_wait", initialWait).map((item, index) => ({
      ...item,
      joined: item?.joined || `99:${String(index).padStart(2, "0")}`,
      deadline: item?.deadline || "9999-12-31"
    }))
  );

  const [reports, setReports] = useState(() =>
    readArray("lab_reports", [])
  );

  const [maxHours, setMaxHours] = useState(() =>
    read("lab_max_hours", 2)
  );

  const [notice, setNotice] = useState("");

  const [login, setLogin] = useState({
    email: "",
    password: ""
  });

  const [loginError, setLoginError] = useState("");

  const [studentIdentity, setStudentIdentity] = useState(() => {
    const value = read("lab_student_identity", {
      student: "",
      studentId: ""
    });

    return value && typeof value === "object"
      ? {
          student: value.student || "",
          studentId: value.studentId || ""
        }
      : {
          student: "",
          studentId: ""
        };
  });

  const [qrBooking, setQrBooking] = useState(() =>
    read("lab_qr_booking", null)
  );

  const [bookingStep, setBookingStep] = useState(1);
  const [studentProjects, setStudentProjects] = useState([]);

  const [form, setForm] = useState({
    student: "",
    studentId: "",
    pc: pcNames[0],
    date: today,
    start: "10:00",
    end: "11:00",
    project: "",
    description: "",
    deadline: "",
    type: "Individual",
    members: ""
  });

  const [report, setReport] = useState({
    bookingId: "",
    worked: "",
    completed: "",
    remaining: "",
    issues: ""
  });

  useEffect(() => {
    localStorage.setItem("lab_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("lab_wait", JSON.stringify(waiting));
  }, [waiting]);

  useEffect(() => {
    localStorage.setItem("lab_reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("lab_max_hours", JSON.stringify(maxHours));
  }, [maxHours]);

  useEffect(() => {
    localStorage.setItem(
      "lab_student_identity",
      JSON.stringify(studentIdentity)
    );
  }, [studentIdentity]);

  useEffect(() => {
    localStorage.setItem("lab_qr_booking", JSON.stringify(qrBooking));
  }, [qrBooking]);

  const myBookings = bookings.filter((b) =>
    studentIdentity.studentId
      ? b.studentId === studentIdentity.studentId
      : b.studentId === "CS23041"
  );

  const activeBookings = bookings.filter(
    (b) =>
      !["Cancelled", "Rejected", "Completed", "No-show"].includes(b.status)
  );

  const pending = bookings.filter((b) => b.status === "Pending");

  const sortedWait = useMemo(
    () =>
      [...waiting].sort(
        (a, b) =>
          (a.deadline || "9999").localeCompare(b.deadline || "9999") ||
          (a.joined || "99:99").localeCompare(b.joined || "99:99")
      ),
    [waiting]
  );

  const update = (k, v) =>
    setForm((p) => ({
      ...p,
      [k]: v
    }));

  function continueToProjects() {
    const cleanName = form.student.trim();
    const cleanUsn = form.studentId.trim().toUpperCase();

    if (
      cleanName.length < 2 ||
      !/^([A-Z0-9-]{5,20})$/.test(cleanUsn)
    ) {
      setNotice(
        "Enter your full name and a valid USN / student ID (5–20 letters or numbers)."
      );
      return;
    }

    setForm((p) => ({
      ...p,
      student: cleanName,
      studentId: cleanUsn
    }));

    const records = [...bookings, ...waiting];
    const firstName = cleanName.split(/\s+/)[0].toLowerCase();

    const matches = records.filter(
      (b) =>
        b.studentId === cleanUsn ||
        (b.members || "").toUpperCase().includes(cleanUsn) ||
        (b.members || "").split(",").some((member) => {
          const value = member.trim().toLowerCase();

          return (
            value === cleanName.toLowerCase() ||
            value === firstName
          );
        })
    );

    const unique = [
      ...new Map(
        matches
          .filter((b) => b.project)
          .map((b) => [
            b.project,
            {
              name: b.project,
              description: b.description || "",
              deadline: b.deadline || ""
            }
          ])
      ).values()
    ];

    setStudentProjects(unique);

    if (unique.length === 1) {
      setForm((p) => ({
        ...p,
        project: unique[0].name,
        description: unique[0].description,
        deadline:
          unique[0].deadline >= today ? unique[0].deadline : ""
      }));

      setBookingStep(3);
    } else {
      setForm((p) => ({
        ...p,
        project: "",
        description: "",
        deadline: ""
      }));

      setBookingStep(2);
    }

    setNotice("");
  }

  function chooseProject(project) {
    const selected = studentProjects.find(
      (p) => p.name === project
    );

    setForm((p) => ({
      ...p,
      project,
      description: selected?.description || p.description,
      deadline:
        selected?.deadline >= today ? selected.deadline : ""
    }));
  }

  const hours = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    return (eh * 60 + em - sh * 60 - sm) / 60;
  };

  function loginAdmin(e) {
    e.preventDefault();

    if (
      login.email === ADMIN_EMAIL &&
      login.password === ADMIN_PASSWORD
    ) {
      setAdmin({ email: login.email });
      setIsAdmin(true);
      setPage("Overview");
      setLoginError("");
      setLogin({ email: "", password: "" });

      localStorage.setItem(
        "lab_admin",
        JSON.stringify({ email: login.email })
      );
    } else {
      setLoginError(
        "Email or password is incorrect. Please try again."
      );
    }
  }

  function logout() {
    setIsAdmin(false);
    setAdmin(null);
    localStorage.removeItem("lab_admin");
    setPage("Overview");
    setNotice("You have signed out of the admin dashboard.");
  }

  function submitBooking(e) {
    e.preventDefault();
    setNotice("");

    const cleanName = form.student.trim();
    const cleanUsn = form.studentId.trim().toUpperCase();

    if (
      cleanName.length < 2 ||
      !/^([A-Z0-9-]{5,20})$/.test(cleanUsn)
    ) {
      setNotice(
        "Enter your full name and a valid USN / student ID (5–20 letters or numbers)."
      );
      return;
    }

    const duration = hours(form.start, form.end);

    if (duration <= 0) {
      setNotice("End time must be later than start time.");
      return;
    }

    if (duration > maxHours) {
      setNotice(
        `Your selected duration is ${duration} hours. The current limit is ${maxHours} hours.`
      );
      return;
    }

    if (!form.deadline) {
      setNotice(
        "Add the project deadline so requests can be prioritized fairly."
      );
      return;
    }

    const clash = activeBookings.some(
      (b) =>
        b.pc === form.pc &&
        b.date === form.date &&
        form.start < b.end &&
        form.end > b.start
    );

    const base = {
      id: Date.now(),
      student: cleanName,
      studentId: cleanUsn,
      email: "",
      ...form,
      student: cleanName,
      studentId: cleanUsn,
      status: clash ? "Waiting list" : "Confirmed",
      members: form.members || cleanName,
      sessionToken: `LABDESK-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)
        .toUpperCase()}`
    };

    setStudentIdentity({
      student: cleanName,
      studentId: cleanUsn
    });

    if (clash) {
      setWaiting((p) => [
        ...p,
        {
          ...base,
          joined: new Date().toTimeString().slice(0, 5)
        }
      ]);

      setNotice(
        "That time is occupied. Your request has been added to the priority waiting list."
      );
    } else {
      setBookings((p) => [base, ...p]);
      setQrBooking(base);

      setNotice(
        "Booking confirmed. Your unique session QR code is ready."
      );
    }

    setPage(clash ? "My bookings" : "Session QR");
    setBookingStep(1);
    setStudentProjects([]);

    setForm((p) => ({
      ...p,
      student: "",
      studentId: "",
      project: "",
      description: "",
      deadline: "",
      members: ""
    }));
  }

  function cancel(id) {
    setBookings((p) =>
      p.map((b) =>
        b.id === id ? { ...b, status: "Cancelled" } : b
      )
    );

    setNotice(
      "Booking cancelled. Admin can now review the waiting list."
    );
  }

  function approve(id) {
    setBookings((p) =>
      p.map((b) =>
        b.id === id ? { ...b, status: "Confirmed" } : b
      )
    );
  }

  function reject(id) {
    setBookings((p) =>
      p.map((b) =>
        b.id === id ? { ...b, status: "Rejected" } : b
      )
    );
  }

  function promote(id) {
    const item = waiting.find((w) => w.id === id);

    if (!item) return;

    const clash = activeBookings.some(
      (b) =>
        b.pc === item.pc &&
        b.date === item.date &&
        item.start < b.end &&
        item.end > b.start
    );

    if (clash) {
      setNotice(
        "That slot is still occupied. Resolve the conflict before offering it."
      );
      return;
    }

    setBookings((p) => [
      { ...item, status: "Confirmed" },
      ...p
    ]);

    setWaiting((p) => p.filter((w) => w.id !== id));

    setNotice(
      `${item.student}'s waiting-list request was promoted to a booking.`
    );
  }

  function saveReport(e) {
    e.preventDefault();

    setReports((p) => [
      {
        ...report,
        id: Date.now(),
        submitted: new Date().toLocaleString()
      },
      ...p
    ]);

    setReport({
      bookingId: "",
      worked: "",
      completed: "",
      remaining: "",
      issues: ""
    });

    setNotice("Session report saved.");
  }

  const studentNav = [
    ["Overview", "▦"],
    ["Book a PC", "＋"],
    ["My bookings", "▤"],
    ["Session QR", "▧"],
    ["My projects", "◇"],
    ["Session reports", "▧"]
  ];

  const adminNav = [
    ["Overview", "▦"],
    ["All bookings", "▤"],
    ["Waiting list", "◷"],
    ["PC management", "▣"],
    ["Students", "♙"],
    ["Reports", "▧"],
    ["Settings", "⚙"]
  ];

  const nav = isAdmin ? adminNav : studentNav;

  if (!isAdmin && page === "Admin login") {
    return (
      <Login
        login={login}
        setLogin={setLogin}
        onSubmit={loginAdmin}
        error={loginError}
        back={() => setPage("Overview")}
      />
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">L</div>
          <div>
            <b>LabDesk</b>
            <small>AI LAB RESOURCE PORTAL</small>
          </div>
        </div>

        <div className="role-pill">
          <span className={isAdmin ? "admin-dot" : "student-dot"} />
          {isAdmin ? "ADMIN WORKSPACE" : "STUDENT WORKSPACE"}
        </div>

        <div className="nav-label">MENU</div>

        <nav>
          {nav.map(([name, icon]) => (
            <button
              key={name}
              className={page === name ? "nav active" : "nav"}
              onClick={() => {
                setPage(name);
                setNotice("");

                if (name === "Book a PC") {
                  setBookingStep(1);
                }
              }}
            >
              <i>{icon}</i>
              {name}

              {name === "Waiting list" && waiting.length > 0 && (
                <em>{waiting.length}</em>
              )}
            </button>
          ))}
        </nav>

        <div className="side-bottom">
          {!isAdmin ? (
            <button
              className="admin-entry"
              onClick={() => setPage("Admin login")}
            >
              <span>♙</span>
              <div>
                <b>Administrator?</b>
                <small>Sign in to manage the lab</small>
              </div>
              <strong>→</strong>
            </button>
          ) : (
            <div className="admin-profile">
              <div className="avatar admin-avatar">AD</div>
              <div>
                <b>Lab Administrator</b>
                <small>{admin?.email}</small>
              </div>
            </div>
          )}

          <div className="sidebar-foot">
            LABDESK · PROTOTYPE V2.0
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="crumb">AI LAB</span>
            <span className="slash">/</span>
            <b>{page.toUpperCase()}</b>
          </div>

          <div className="top-right">
            <span className="system-status">
              <i />
              System demo
            </span>

            {isAdmin ? (
              <>
                <span className="top-user">Administrator</span>
                <button className="logout" onClick={logout}>
                  Sign out ↗
                </button>
              </>
            ) : (
              <>
                <span className="top-user">
                  {studentIdentity.student || "Student"}
                </span>

                <div className="avatar">
                  {studentIdentity.student
                    ? studentIdentity.student
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)
                    : "ST"}
                </div>
              </>
            )}
          </div>
        </header>

        <div className="content">
          {notice && (
            <div className="notice">
              <span>ⓘ</span>
              {notice}
              <button onClick={() => setNotice("")}>×</button>
            </div>
          )}

          {page === "Overview" && !isAdmin && (
            <>
              <Heading
                eyebrow="STUDENT PORTAL"
                title={`Welcome${
                  studentIdentity.student
                    ? ", " + studentIdentity.student.split(" ")[0]
                    : " to LabDesk"
                }`}
                sub="Plan your lab time, make progress and keep your projects moving."
                action={
                  <button
                    className="primary"
                    onClick={() => {
                      setBookingStep(1);
                      setPage("Book a PC");
                    }}
                  >
                    ＋ Book a computer
                  </button>
                }
              />

              <div className="student-banner">
                <div>
                  <span className="banner-kicker">
                    YOUR NEXT STEP STARTS HERE
                  </span>

                  <h2>
                    Build something
                    <br />
                    brilliant today.
                  </h2>

                  <p>
                    Reserve a workstation for your next project session.
                  </p>

                  <button
                    onClick={() => {
                      setBookingStep(1);
                      setPage("Book a PC");
                    }}
                  >
                    Find a time slot <b>→</b>
                  </button>
                </div>

                <div className="banner-art">
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <div className="art-chip">
                    AI<span>✦</span>
                  </div>
                  <div className="art-star">✳</div>
                </div>
              </div>

              <Stats
                items={[
                  ["My bookings", myBookings.length, "Your reservations", "▤"],
                  [
                    "Upcoming",
                    myBookings.filter((b) => b.status === "Confirmed").length,
                    "Confirmed sessions",
                    "◷"
                  ],
                  [
                    "Projects",
                    new Set(myBookings.map((b) => b.project)).size,
                    "In your workspace",
                    "◇"
                  ]
                ]}
              />

              <Section
                title="Your upcoming sessions"
                sub="A quick look at your confirmed lab time"
                action="View all"
                onAction={() => setPage("My bookings")}
              />

              <BookingTable
                items={myBookings.slice(0, 4)}
                admin={false}
                onCancel={cancel}
                onShowQR={(b) => {
                  setQrBooking(b);
                  setPage("Session QR");
                }}
              />

              <Section
                title="Lab workstations"
                sub="Shared computers available for student projects"
              />

              <div className="pc-grid">
                {pcNames.map((pc, i) => (
                  <div className="pc-card" key={pc}>
                    <div className="pc-head">
                      <div className="pc-symbol">▣</div>
                      <Tag>Available</Tag>
                    </div>

                    <h3>{pc}</h3>

                    <p>
                      {i ? "Ubuntu workstation" : "Windows 11 workstation"} ·
                      AI Lab
                    </p>

                    <button
                      className="inline-link"
                      onClick={() => {
                        update("pc", pc);
                        setBookingStep(1);
                        setPage("Book a PC");
                      }}
                    >
                      Book this PC →
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "Overview" && isAdmin && (
            <>
              <Heading
                eyebrow="ADMIN CONTROL CENTER"
                title="Lab operations overview"
                sub="Monitor reservations, prioritize urgent work and keep shared resources running smoothly."
                action={
                  <button
                    className="outline-btn"
                    onClick={() => setPage("Settings")}
                  >
                    ⚙ Booking rules
                  </button>
                }
              />

              <Stats
                items={[
                  [
                    "Active bookings",
                    activeBookings.length,
                    "Across both workstations",
                    "▤"
                  ],
                  [
                    "Awaiting review",
                    pending.length,
                    "Requests needing action",
                    "◷"
                  ],
                  [
                    "Waiting list",
                    waiting.length,
                    "Sorted by nearest deadline",
                    "⇅"
                  ],
                  [
                    "Session duration",
                    `${maxHours}h`,
                    "Current maximum per booking",
                    "◷"
                  ]
                ]}
              />

              <div className="admin-grid">
                <div className="panel">
                  <Section
                    title="Priority waiting list"
                    sub="Nearest project deadline gets reviewed first"
                    action="Open queue"
                    onAction={() => setPage("Waiting list")}
                  />

                  <PriorityList
                    items={sortedWait.slice(0, 3)}
                    compact
                  />
                </div>

                <div className="panel">
                  <Section
                    title="Needs your attention"
                    sub="Requests waiting for a decision"
                  />

                  {pending.length ? (
                    pending.slice(0, 3).map((b) => (
                      <div className="attention-row" key={b.id}>
                        <div className="mini-avatar">
                          {b.student
                            .split(" ")
                            .map((x) => x[0])
                            .join("")}
                        </div>

                        <div>
                          <b>{b.project}</b>
                          <small>
                            {b.student} · {b.date} · {b.pc}
                          </small>
                        </div>

                        <button onClick={() => setPage("All bookings")}>
                          Review →
                        </button>
                      </div>
                    ))
                  ) : (
                    <Empty
                      title="All caught up"
                      text="There are no pending booking requests."
                    />
                  )}
                </div>
              </div>

              <Section
                title="Latest reservations"
                sub="Recent activity across the lab"
                action="View all"
                onAction={() => setPage("All bookings")}
              />

              <BookingTable
                items={bookings.slice(0, 5)}
                admin
                onCancel={cancel}
                onApprove={approve}
                onReject={reject}
              />
            </>
          )}

          {page === "Book a PC" && (
            <>
              <Heading
                eyebrow="RESERVE A WORKSTATION"
                title="Book your lab session"
                sub="Choose a PC, select a time and tell us what you want to achieve."
              />

              <div className="booking-layout">
                <form
                  className="panel form-panel"
                  onSubmit={(e) => {
                    if (bookingStep !== 3) {
                      e.preventDefault();
                      return;
                    }

                    submitBooking(e);
                  }}
                >
                  {bookingStep === 1 && (
                    <>
                      <div className="form-title">
                        <div>
                          <span className="step">
                            01 / STUDENT DETAILS
                          </span>
                          <h2>Who is booking the PC?</h2>
                        </div>
                      </div>

                      <div className="two-col identity-fields">
                        <div>
                          <label>Student full name *</label>
                          <input
                            value={form.student}
                            onChange={(e) =>
                              update("student", e.target.value)
                            }
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                          />
                        </div>

                        <div>
                          <label>USN / Student ID *</label>
                          <input
                            value={form.studentId}
                            onChange={(e) =>
                              update(
                                "studentId",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="e.g. 1AB23CS045"
                            autoComplete="off"
                            minLength="5"
                            maxLength="20"
                            required
                          />

                          <small className="field-hint">
                            Use your official college USN.
                          </small>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="primary submit-btn"
                        onClick={continueToProjects}
                      >
                        Continue to my projects →
                      </button>
                    </>
                  )}

                  {bookingStep === 2 && (
                    <>
                      <div className="form-title">
                        <div>
                          <span className="step">02 / YOUR PROJECTS</span>
                          <h2>Select the project you are working on</h2>
                        </div>
                      </div>

                      <p className="field-hint">
                        Projects already linked to this USN or listed group
                        membership appear here.
                      </p>

                      {studentProjects.length > 0 ? (
                        <div className="project-grid project-picker">
                          {studentProjects.map((project) => (
                            <button
                              type="button"
                              key={project.name}
                              className={
                                form.project === project.name
                                  ? "panel project-card pc-option selected"
                                  : "panel project-card pc-option"
                              }
                              onClick={() =>
                                chooseProject(project.name)
                              }
                            >
                              <div className="pc-symbol">◇</div>
                              <h3>{project.name}</h3>
                              <p>
                                {project.description || "Existing project"}
                              </p>

                              <span className="radio">
                                {form.project === project.name
                                  ? "✓"
                                  : "Select"}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <>
                          <div className="empty">
                            <span>◇</span>
                            <b>No linked projects found</b>
                            <p>
                              You can enter the project name below to continue.
                            </p>
                          </div>

                          <label>Project name *</label>
                          <input
                            value={form.project}
                            onChange={(e) =>
                              update("project", e.target.value)
                            }
                            placeholder="Enter your project name"
                            required
                          />
                        </>
                      )}

                      <div className="actions">
                        <button
                          type="button"
                          className="outline-btn"
                          onClick={() => setBookingStep(1)}
                        >
                          ← Back
                        </button>

                        <button
                          type="button"
                          className="primary"
                          disabled={!form.project.trim()}
                          onClick={() => setBookingStep(3)}
                        >
                          Continue to booking details →
                        </button>
                      </div>
                    </>
                  )}

                  {bookingStep === 3 && (
                    <>
                      <div className="form-title">
                        <div>
                          <span className="step">
                            03 / SESSION DETAILS
                          </span>
                          <h2>Reserve your workstation</h2>
                        </div>

                        <span className="required-note">
                          {form.student} · {form.studentId}
                        </span>
                      </div>

                      <div className="selected-project">
                        <b>Selected project</b>
                        <span>{form.project}</span>

                        <button
                          type="button"
                          className="inline-link"
                          onClick={() => setBookingStep(2)}
                        >
                          Change project
                        </button>
                      </div>

                      <label>Choose workstation *</label>

                      <div className="pc-select">
                        {pcNames.map((pc, i) => (
                          <button
                            type="button"
                            key={pc}
                            className={
                              form.pc === pc
                                ? "pc-option selected"
                                : "pc-option"
                            }
                            onClick={() => update("pc", pc)}
                          >
                            <span className="pc-mini">▣</span>

                            <span>
                              <b>{pc}</b>
                              <small>
                                {i
                                  ? "Ubuntu · 16 GB RAM"
                                  : "Windows 11 · 16 GB RAM"}
                              </small>
                            </span>

                            <span className="radio">
                              {form.pc === pc ? "✓" : ""}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="two-col">
                        <div>
                          <label>Session date *</label>
                          <input
                            type="date"
                            min={today}
                            value={form.date}
                            onChange={(e) =>
                              update("date", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div>
                          <label>Booking type</label>
                          <select
                            value={form.type}
                            onChange={(e) =>
                              update("type", e.target.value)
                            }
                          >
                            <option>Individual</option>
                            <option>Group</option>
                            <option>Special</option>
                          </select>
                        </div>

                        <div>
                          <label>Start time *</label>
                          <input
                            type="time"
                            value={form.start}
                            onChange={(e) =>
                              update("start", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div>
                          <label>End time *</label>
                          <input
                            type="time"
                            value={form.end}
                            onChange={(e) =>
                              update("end", e.target.value)
                            }
                            required
                          />

                          <small className="field-hint">
                            Maximum allowed: {maxHours} hours per session
                          </small>
                        </div>
                      </div>

                      <div className="duration-preview">
                        <span>Selected duration</span>
                        <b>
                          {hours(form.start, form.end) > 0
                            ? hours(form.start, form.end) + " hours"
                            : "Check your time"}
                        </b>
                      </div>

                      <div className="form-separator" />

                      <div className="form-title">
                        <div>
                          <span className="step">PROJECT DETAILS</span>
                          <h2>What will you work on?</h2>
                        </div>
                      </div>

                      <label>Project description *</label>
                      <textarea
                        rows="3"
                        value={form.description}
                        onChange={(e) =>
                          update("description", e.target.value)
                        }
                        placeholder="Briefly describe the task you plan to complete during this session..."
                        required
                      />

                      <label>Project deadline *</label>
                      <input
                        type="date"
                        min={today}
                        value={form.deadline}
                        onChange={(e) =>
                          update("deadline", e.target.value)
                        }
                        required
                      />

                      <small className="field-hint">
                        The admin uses this date to prioritize waiting-list
                        requests. Enter the real project deadline.
                      </small>

                      {form.type === "Group" && (
                        <>
                          <label>Group members</label>
                          <input
                            value={form.members}
                            onChange={(e) =>
                              update("members", e.target.value)
                            }
                            placeholder="Names separated by commas"
                          />
                        </>
                      )}

                      <label className="consent">
                        <input type="checkbox" required />
                        <span>
                          I agree to use the workstation responsibly, save my
                          work and log out after the session.
                        </span>
                      </label>

                      <button className="primary submit-btn">
                        Confirm booking & generate session QR <b>→</b>
                      </button>

                      <button
                        type="button"
                        className="back-btn"
                        onClick={() => setBookingStep(2)}
                      >
                        ← Back to project selection
                      </button>
                    </>
                  )}
                </form>

                <aside className="booking-aside">
                  <div className="aside-card limit-card">
                    <span className="aside-icon">◷</span>
                    <h3>Session time limit</h3>
                    <p>
                      Each booking can be up to <b>{maxHours} hours</b>.
                      Contact the lab admin if your project needs an
                      exception.
                    </p>
                  </div>

                  <div className="aside-card">
                    <span className="aside-icon purple">⇅</span>
                    <h3>How the waiting list works</h3>
                    <ol>
                      <li>
                        When a PC slot is occupied, your request joins the
                        queue.
                      </li>
                      <li>
                        Requests are prioritized by the nearest project
                        deadline.
                      </li>
                      <li>
                        If deadlines match, earlier queue entry comes first.
                      </li>
                      <li>
                        Admin confirms availability before promoting a
                        request.
                      </li>
                    </ol>
                  </div>

                  <div className="privacy-note">
                    <b>Fair access matters.</b>
                    <br />
                    Please provide an accurate deadline. Priority is a
                    scheduling aid, not a guarantee of a slot.
                  </div>
                </aside>
              </div>
            </>
          )}

          {page === "Session QR" && !isAdmin && (
            <>
              <Heading
                eyebrow="YOUR SESSION PASS"
                title="Booking QR code"
                sub="Show this QR code at the lab when you arrive for your reserved session."
              />

              <div className="session-qr-layout">
                <div className="panel session-qr-card">
                  {qrBooking && qrBooking.status === "Confirmed" ? (
                    <>
                      <div className="qr-success">
                        ✓ BOOKING CONFIRMED
                      </div>

                      <QRCodeSVG
                        value={JSON.stringify({
                          app: "LabDesk",
                          type: "SESSION_CHECK_IN",
                          token:
                            qrBooking.sessionToken ||
                            String(qrBooking.id),
                          bookingId: qrBooking.id,
                          usn: qrBooking.studentId,
                          pc: qrBooking.pc,
                          date: qrBooking.date,
                          start: qrBooking.start,
                          end: qrBooking.end
                        })}
                        size={230}
                        level="H"
                        includeMargin
                      />

                      <h2>{qrBooking.student}</h2>
                      <p className="qr-usn">
                        {qrBooking.studentId}
                      </p>

                      <div className="qr-booking-details">
                        <span>{qrBooking.pc}</span>
                        <b>
                          {qrBooking.date} · {qrBooking.start}–
                          {qrBooking.end}
                        </b>
                        <small>{qrBooking.project}</small>
                      </div>

                      <button
                        className="outline-btn"
                        onClick={() => {
                          const svg = document.querySelector(
                            ".session-qr-card svg"
                          );

                          if (!svg) return;

                          const blob = new Blob(
                            [
                              new XMLSerializer().serializeToString(svg)
                            ],
                            {
                              type: "image/svg+xml"
                            }
                          );

                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");

                          a.href = url;
                          a.download = `LabDesk-Session-${qrBooking.studentId}.svg`;
                          a.click();

                          URL.revokeObjectURL(url);
                        }}
                      >
                        ↓ Download QR code
                      </button>
                    </>
                  ) : (
                    <Empty
                      title="No confirmed session QR yet"
                      text="Book an available slot first. A QR code is generated once your booking is confirmed."
                    />
                  )}
                </div>

                <aside className="panel qr-instructions">
                  <h2>At the lab</h2>

                  <ol>
                    <li>
                      Arrive at your booked PC before the session starts.
                    </li>
                    <li>
                      Show this QR code to the lab admin or scan station.
                    </li>
                    <li>
                      The admin verifies your booking and records check-in.
                    </li>
                    <li>
                      Scan again or ask the admin to record check-out when
                      finished.
                    </li>
                  </ol>

                  <p>
                    <b>Keep your QR private.</b> It is tied to this booking
                    and should not be shared with another student.
                  </p>
                </aside>
              </div>
            </>
          )}

          {(page === "My bookings" || page === "All bookings") && (
            <>
              <Heading
                eyebrow={
                  isAdmin ? "RESERVATION MANAGEMENT" : "YOUR SCHEDULE"
                }
                title={
                  page === "All bookings"
                    ? "All lab bookings"
                    : "My bookings"
                }
                sub={
                  isAdmin
                    ? "Review requests, resolve conflicts and manage confirmed sessions."
                    : "Review your reservations and keep track of your upcoming lab sessions."
                }
                action={
                  !isAdmin && (
                    <button
                      className="primary"
                      onClick={() => {
                        setBookingStep(1);
                        setPage("Book a PC");
                      }}
                    >
                      ＋ New booking
                    </button>
                  )
                }
              />

              <BookingTable
                items={
                  page === "All bookings" ? bookings : myBookings
                }
                admin={isAdmin}
                onCancel={cancel}
                onApprove={approve}
                onReject={reject}
                onShowQR={(b) => {
                  setQrBooking(b);
                  setPage("Session QR");
                }}
              />
            </>
          )}

          {page === "Waiting list" && (
            <>
              <Heading
                eyebrow="QUEUE PRIORITIZATION"
                title="Waiting list"
                sub="Requests are automatically ordered by nearest project deadline, then by join time."
              />

              <div className="queue-summary">
                <div>
                  <small>REQUESTS IN QUEUE</small>
                  <b>{waiting.length}</b>
                </div>

                <div>
                  <small>PRIORITY RULE</small>
                  <b>Nearest deadline first</b>
                </div>

                <div>
                  <small>TIE BREAKER</small>
                  <b>Earlier join time</b>
                </div>
              </div>

              <div className="panel queue-panel">
                <Section
                  title="Priority order"
                  sub="Review the most urgent project deadline first"
                />

                <PriorityList
                  items={sortedWait}
                  admin={isAdmin}
                  onPromote={promote}
                  onRemove={(id) =>
                    setWaiting((p) =>
                      p.filter((x) => x.id !== id)
                    )
                  }
                />

                {!waiting.length && (
                  <Empty
                    title="The queue is clear"
                    text="No students are currently waiting for a slot."
                  />
                )}
              </div>
            </>
          )}

          {page === "PC management" && (
            <>
              <Heading
                eyebrow="RESOURCE CONTROL"
                title="Workstation management"
                sub="Monitor shared lab PCs and update their operational status."
              />

              <div className="pc-grid">
                {pcNames.map((pc, i) => (
                  <div className="pc-card" key={pc}>
                    <div className="pc-head">
                      <div className="pc-symbol">▣</div>
                      <Tag>Available</Tag>
                    </div>

                    <h3>{pc}</h3>

                    <p>
                      {i ? "Ubuntu" : "Windows 11"} · AI Lab · 16 GB RAM
                    </p>

                    <label>Operational status</label>

                    <select defaultValue="Available">
                      <option>Available</option>
                      <option>Maintenance</option>
                      <option>Unavailable</option>
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "Students" && (
            <>
              <Heading
                eyebrow="STUDENT ACCESS"
                title="Student directory"
                sub="Demo directory of registered lab users. Real identity verification requires a backend."
              />

              <div className="panel">
                {[
                  [
                    "Aarav Sharma",
                    "CS23041",
                    "Computer Science · 3rd Year"
                  ],
                  [
                    "Meera Nair",
                    "CS23018",
                    "Computer Science · 3rd Year"
                  ],
                  [
                    "Rohan Das",
                    "CS23027",
                    "Computer Science · 3rd Year"
                  ],
                  [
                    "Ishita Rao",
                    "CS23052",
                    "Computer Science · 3rd Year"
                  ]
                ].map((s) => (
                  <div className="student-row" key={s[1]}>
                    <div className="avatar">
                      {s[0]
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </div>

                    <div>
                      <b>{s[0]}</b>
                      <small>
                        {s[1]} · {s[2]}
                      </small>
                    </div>

                    <Tag>Active</Tag>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "My projects" && (
            <>
              <Heading
                eyebrow="PROJECT WORKSPACE"
                title="My projects"
                sub="Projects connected to your lab booking activity."
              />

              <div className="project-grid">
                {[...new Set(myBookings.map((b) => b.project))].map(
                  (p) => (
                    <div className="panel project-card" key={p}>
                      <div className="pc-symbol">◇</div>
                      <h3>{p}</h3>
                      <p>
                        {myBookings.find((b) => b.project === p)?.description}
                      </p>
                      <Tag>Active</Tag>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {page === "Session reports" && (
            <>
              <Heading
                eyebrow="SESSION DOCUMENTATION"
                title="Session reports"
                sub="Record what you completed and what still needs attention."
              />

              <div className="booking-layout">
                <form className="panel form-panel" onSubmit={saveReport}>
                  <h2>Submit session report</h2>

                  <label>Booking *</label>

                  <select
                    value={report.bookingId}
                    onChange={(e) =>
                      setReport((p) => ({
                        ...p,
                        bookingId: e.target.value
                      }))
                    }
                    required
                  >
                    <option value="">Select a booking</option>

                    {myBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.project} · {b.date}
                      </option>
                    ))}
                  </select>

                  {[
                    ["worked", "What did you work on? *"],
                    ["completed", "What did you complete?"],
                    ["remaining", "What remains to be done?"],
                    ["issues", "Any issues or maintenance concerns?"]
                  ].map(([k, l]) => (
                    <div key={k}>
                      <label>{l}</label>

                      <textarea
                        rows="2"
                        value={report[k]}
                        onChange={(e) =>
                          setReport((p) => ({
                            ...p,
                            [k]: e.target.value
                          }))
                        }
                        required={k === "worked"}
                      />
                    </div>
                  ))}

                  <button className="primary submit-btn">
                    Save session report →
                  </button>
                </form>

                <div className="panel">
                  <h2>Submitted reports</h2>

                  {reports.length ? (
                    reports.map((r) => (
                      <div className="report-row" key={r.id}>
                        <b>{r.worked}</b>
                        <small>{r.submitted}</small>
                      </div>
                    ))
                  ) : (
                    <Empty
                      title="No reports yet"
                      text="Reports you submit will appear here."
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {page === "Reports" && (
            <>
              <Heading
                eyebrow="LAB ANALYTICS"
                title="Reports & insights"
                sub="A high-level view of lab activity and request status."
              />

              <Stats
                items={[
                  [
                    "Total requests",
                    bookings.length,
                    "All booking records",
                    "▤"
                  ],
                  [
                    "Confirmed",
                    bookings.filter((b) => b.status === "Confirmed").length,
                    "Approved sessions",
                    "✓"
                  ],
                  ["Pending", pending.length, "Awaiting review", "◷"],
                  ["Reports", reports.length, "Student submissions", "▧"]
                ]}
              />

              <div className="panel">
                <h2>Booking status overview</h2>

                {[
                  "Confirmed",
                  "Pending",
                  "Waiting list",
                  "Rejected",
                  "Cancelled"
                ].map((s) => (
                  <div className="bar-row" key={s}>
                    <span>{s}</span>

                    <div>
                      <i
                        style={{
                          width:
                            (bookings.filter((b) => b.status === s).length /
                              Math.max(1, bookings.length)) *
                              100 +
                            "%"
                        }}
                      />
                    </div>

                    <b>
                      {bookings.filter((b) => b.status === s).length}
                    </b>
                  </div>
                ))}
              </div>
            </>
          )}

          {page === "Settings" && (
            <>
              <Heading
                eyebrow="POLICY & CONFIGURATION"
                title="Booking rules"
                sub="Set the maximum session duration applied to new student booking requests."
              />

              <div className="settings-layout">
                <div className="panel setting-card">
                  <div className="setting-icon">◷</div>
                  <h2>Maximum session duration</h2>

                  <p>
                    Students cannot request a booking longer than this limit.
                    Existing bookings are not changed when you update the
                    setting.
                  </p>

                  <label>Duration limit</label>

                  <div className="duration-control">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={maxHours}
                      onChange={(e) =>
                        setMaxHours(
                          Math.max(
                            1,
                            Math.min(12, Number(e.target.value) || 1)
                          )
                        )
                      }
                    />

                    <span>hours per booking</span>
                  </div>

                  <div className="preset-row">
                    {[1, 2, 3, 4].map((n) => (
                      <button
                        className={
                          maxHours === n ? "preset selected" : "preset"
                        }
                        onClick={() => setMaxHours(n)}
                        key={n}
                        type="button"
                      >
                        {n}h
                      </button>
                    ))}
                  </div>

                  <div className="success-hint">
                    ✓ Setting is saved automatically in this browser.
                  </div>
                </div>

                <div className="panel">
                  <h2>Priority policy</h2>

                  <p className="muted">
                    Waiting-list order is calculated from the project
                    deadline.
                  </p>

                  <div className="policy-step">
                    <b>01</b>
                    <span>
                      <strong>Nearest deadline</strong>
                      <small>
                        Earliest project deadline receives the highest
                        priority.
                      </small>
                    </span>
                  </div>

                  <div className="policy-step">
                    <b>02</b>
                    <span>
                      <strong>Earlier queue entry</strong>
                      <small>
                        Used as a tie-breaker when deadlines are equal.
                      </small>
                    </span>
                  </div>

                  <div className="policy-step">
                    <b>03</b>
                    <span>
                      <strong>Admin confirmation</strong>
                      <small>
                        Priority does not auto-book a PC; admin checks
                        availability.
                      </small>
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Login({ login, setLogin, onSubmit, error, back }) {
  return (
    <div className="login-screen">
      <div className="login-brand">
        <div className="brand-icon">L</div>
        <b>LabDesk</b>
        <span>AI LAB RESOURCE PORTAL</span>
      </div>

      <form className="login-card" onSubmit={onSubmit}>
        <div className="login-lock">♙</div>
        <span className="step">RESTRICTED ACCESS</span>
        <h1>Administrator sign in</h1>
        <p>
          Sign in to manage lab resources, bookings and student access.
        </p>

        <label>Admin email</label>
        <input
          type="email"
          autoComplete="username"
          placeholder="admin@ailab.edu"
          value={login.email}
          onChange={(e) =>
            setLogin((p) => ({
              ...p,
              email: e.target.value
            }))
          }
          required
        />

        <label>Password</label>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={login.password}
          onChange={(e) =>
            setLogin((p) => ({
              ...p,
              password: e.target.value
            }))
          }
          required
        />

        {error && <div className="login-error">{error}</div>}

        <button className="primary login-submit">
          Sign in to admin dashboard →
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={back}
        >
          ← Back to student portal
        </button>

        <div className="demo-credentials">
          <b>Demo credentials</b>
          <span>Email: admin@ailab.edu</span>
          <span>Password: LabAdmin@123</span>
        </div>
      </form>

      <small className="login-footer">
        DEMO AUTHENTICATION · REPLACE WITH SECURE SERVER LOGIN BEFORE
        DEPLOYMENT
      </small>
    </div>
  );
}

function Heading({ eyebrow, title, sub, action }) {
  return (
    <div className="heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Section({ title, sub, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>

      {action && (
        <button className="inline-link" onClick={onAction}>
          {action} →
        </button>
      )}
    </div>
  );
}

function Stats({ items }) {
  return (
    <div className="stats">
      {items.map((x, i) => (
        <div className="stat-card" key={x[0]}>
          <div className={"stat-icon tone" + i}>{x[3]}</div>
          <small>{x[0]}</small>
          <strong>{x[1]}</strong>
          <span>{x[2]}</span>
        </div>
      ))}
    </div>
  );
}

function BookingTable({
  items,
  admin,
  onCancel,
  onApprove,
  onReject,
  onShowQR
}) {
  return (
    <div className="panel table-panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PROJECT / STUDENT</th>
              <th>WORKSTATION</th>
              <th>DATE & TIME</th>
              <th>DEADLINE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {items.length ? (
              items.map((b) => (
                <tr key={b.id}>
                  <td>
                    <b>{b.project}</b>
                    <small>
                      {admin
                        ? `${b.student} · ${b.studentId}`
                        : b.description}
                    </small>
                  </td>

                  <td>{b.pc}</td>

                  <td>
                    {b.date}
                    <small>
                      {b.start} – {b.end}
                    </small>
                  </td>

                  <td>{b.deadline || "—"}</td>

                  <td>
                    <Tag>{b.status}</Tag>
                  </td>

                  <td>
                    {admin && b.status === "Pending" ? (
                      <div className="actions">
                        <button
                          className="approve"
                          onClick={() => onApprove(b.id)}
                        >
                          Approve
                        </button>

                        <button
                          className="reject"
                          onClick={() => onReject(b.id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : !admin &&
                      !["Cancelled", "Rejected", "Completed"].includes(
                        b.status
                      ) ? (
                      <div className="actions">
                        {b.status === "Confirmed" && onShowQR && (
                          <button
                            className="approve"
                            onClick={() => onShowQR(b)}
                          >
                            Session QR
                          </button>
                        )}

                        <button
                          className="cancel"
                          onClick={() => onCancel(b.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <Empty
                    title="Nothing to show"
                    text="Booking records will appear here."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriorityList({
  items,
  admin,
  onPromote,
  onRemove,
  compact
}) {
  return (
    <div className="priority-list">
      {items.map((w, i) => (
        <div className="priority-row" key={w.id}>
          <div className="rank">
            {String(i + 1).padStart(2, "0")}
          </div>

          <div className="priority-main">
            <div className="priority-top">
              <b>{w.project}</b>
              {i === 0 && (
                <span className="urgent">HIGHEST PRIORITY</span>
              )}
            </div>

            <small>
              {w.student} · {w.studentId} · {w.pc}
            </small>

            <div className="priority-meta">
              <span>
                ◷ {w.date}, {w.start}–{w.end}
              </span>
              <strong>Deadline: {w.deadline}</strong>
            </div>
          </div>

          {admin && (
            <div className="queue-actions">
              <button
                className="approve"
                onClick={() => onPromote(w.id)}
              >
                Promote
              </button>

              <button
                className="reject"
                onClick={() => onRemove(w.id)}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      {!items.length && (
        <Empty
          title="No waiting requests"
          text="The waiting list is currently empty."
        />
      )}
    </div>
  );
}

function Empty({ title, text }) {
  return (
    <div className="empty">
      <span>◇</span>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

export default App;
