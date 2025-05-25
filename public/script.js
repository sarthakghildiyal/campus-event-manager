document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
});

async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  //const role = "admin";

  // Determine endpoint based on page URL
  let endpoint = "http://localhost:5500/api/student-register";
  if (window.location.href.includes("admin-login")) {
    endpoint = "http://localhost:5500/api/admin-register";
  }

  let role = "student";
  if (window.location.href.includes("admin-register")) {
    role = "admin";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    if (res.ok) {
      M.toast({ html: data.message, classes: 'green' });
      // setTimeout(() => window.location.href = "admin-login.html", 1500);
      setTimeout(() => {
        window.location.href = role === "admin" ? "admin-login.html" : "student-login.html";
      }, 1500);
    } else {
      M.toast({ html: data.message || "Registration failed", classes: 'red' });
    }
  } catch (err) {
    M.toast({ html: "Server error", classes: 'red' });
    console.error(err);
  }
}

async function loginUser(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Determine endpoint based on page URL
  let endpoint = "http://localhost:5500/api/student-login";
  if (window.location.href.includes("admin-login")) {
    endpoint = "http://localhost:5500/api/admin-login";
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));

      //   localStorage.setItem("token", data.token);
      M.toast({ html: data.message, classes: 'green' });
      setTimeout(() => window.location.href = "index.html", 1500);
    } else {
      M.toast({ html: data.message || "Login failed", classes: 'red' });
    }
  } catch (err) {
    M.toast({ html: "Server error", classes: 'red' });
    console.error(err);
  }
}

// async function loginUserS(event) {
//   event.preventDefault();
//   const email = document.getElementById("loginEmail").value;
//   const password = document.getElementById("loginPassword").value;

//   try {
//     const res = await fetch("http://localhost:5500/api/student-login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password })
//     });

//     const data = await res.json();

//     if (res.ok) {
//       localStorage.setItem("token", data.token);
//       M.toast({ html: data.message, classes: 'green' });
//       setTimeout(() => window.location.href = "index.html", 1500);
//     } else {
//       M.toast({ html: data.message || "Login failed", classes: 'red' });
//     }
//   } catch (err) {
//     M.toast({ html: "Server error", classes: 'red' });
//     console.error(err);
//   }
// }

async function resetPassword(event) {
  event.preventDefault();

  const email = document.getElementById("resetEmail").value;
  const newPassword = document.getElementById("newPassword").value;

  try {
    const res = await fetch("http://localhost:5500/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });

    const data = await res.json();

    if (res.ok) {
      M.toast({ html: data.message, classes: 'green' });
      setTimeout(() => window.location.href = "index.html", 1500);
    } else {
      M.toast({ html: data.message || "Failed to reset password", classes: 'red' });
    }
  } catch (err) {
    M.toast({ html: "Server error", classes: 'red' });
    console.error(err);
  }
}

// function logout() {
//   localStorage.removeItem("token");
//   M.toast({ html: "Logged out", classes: 'blue' });
//   window.location.href = "index.html";
// }

async function addEvent(event) {
  event.preventDefault();

  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;
  const token = localStorage.getItem("token");

  if (!token) {
    M.toast({ html: "Please login first", classes: 'red' });
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ title, date, location })
    });

    const data = await res.json();

    if (res.ok) {
      M.toast({ html: data.message, classes: 'green' });
      setTimeout(() => window.location.href = "index.html", 1500);
    } else {
      M.toast({ html: data.message || "Failed to create event", classes: 'red' });
    }
  } catch (err) {
    M.toast({ html: "Server error", classes: 'red' });
    console.error(err);
  }
}

async function loadEvents() {
  const nav = document.getElementById("nav-links");
  const token = localStorage.getItem("token");

  // if (nav) {
  //   nav.innerHTML = token
  //     // ? '<li><a href="create-event.html">Add Event</a></li><li><a href="#" onclick="logout()">Logout</a></li>'
  //     // : '<li><a href="admin-login.html">Login</a></li><li><a href="register.html">Register</a></li>';
  //     // <!-- Trigger Buttons -->
  //     ? '<a href="#" onclick="logout()">Logout</a></li>'
  //     : '<li><a class="modal-trigger" href="#loginModal">Login</a></li><li><a class="modal-trigger" href="#registerModal">Register</a></li>';
  // }

  try {
    const res = await fetch("http://localhost:5500/api/events");

    const eventsContainer = document.getElementById("events");
    const events = await res.json();

    if (!eventsContainer) return;

    if (events.length === 0) {
      eventsContainer.innerHTML = "<p>No events to display.</p>";
    } else {
      events.forEach(event => {
        const col = document.createElement("div");
        col.className = "col s12 m6 l4";
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="card hoverable event-card" data-id="${event._id}">
          <div class="card-content">
          <span class="card-title">${event.title}</span>
          <p><i class="material-icons left">event</i>${event.date}</p>
          <p><i class="material-icons left">location_on</i>${event.location}</p>
          </div>`;
        col.appendChild(card);
        eventsContainer.appendChild(col);
      });
      enableEventCardClicks();
    }
  } catch (err) {
    console.error("Failed to fetch events:", err);
  }
}

function enableEventCardClicks() {
  const cards = document.querySelectorAll(".event-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      if (id) {
        window.location.href = `event-details.html?id=${id}`;
      }
    });
  });
}


async function fetchAndDisplayStudents() {
  const container = document.getElementById("studentsList");
  const token = localStorage.getItem("token");

  if (!container || !token) return;

  try {
    const res = await fetch("http://localhost:5500/api/students", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch students");
    }

    const students = await res.json();

    if (students.length === 0) {
      container.innerHTML = "<p>No registered students.</p>";
    } else {
      students.forEach(student => {
        const div = document.createElement("div");
        div.className = "col s12 m6 l4";
        div.innerHTML = `
          <div class="card blue lighten-5 z-depth-2">
            <div class="card-content">
              <span class="card-title">${student.name}</span>
              <p><strong>Email:</strong> ${student.email}</p>
            </div>
          </div>
        `;
        container.appendChild(div);
      });
    }

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading students. Please try again later.</p>";
  }
}


document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadEvents();
});

// document.addEventListener('DOMContentLoaded', function () {
//   var modals = document.querySelectorAll('.modal');
//   M.Modal.init(modals);
// });


document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.getElementById("nav-links");
  const storedUser = localStorage.getItem("currentUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (navLinks) {
    if (user) {
      if (user.role === "admin") {
        navLinks.innerHTML = `
        <li><a href="admin-dashboard.html">Dashboard</a></li>
        <li><a href="create-event.html">Add Event</a></li>
        <li><a href="#" onclick="logout()">Logout</a></li>
      `;
      } else if (user.role === "student") {
        navLinks.innerHTML = `
        <li><a href="student-dashboard.html">Dashboard</a></li>
        <li><a href="#" onclick="logout()">Logout</a></li>
      `;
      }
    } else {
      navLinks.innerHTML = `
      <li><a href="#loginModal" class="modal-trigger">Login</a></li>
      <li><a href="#registerModal" class="modal-trigger">Register</a></li>
    `;
    }
  }

  // Initialize Materialize modals
  M.Modal.init(document.querySelectorAll('.modal'));
});

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
  M.toast({ html: "Logged out", classes: 'blue' });
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayStudents();
});

async function updateAdminProfile(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5500/api/admin/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      M.toast({ html: data.message, classes: 'green' });
      window.location.href = "admin-dashboard.html";
    } else {
      M.toast({ html: data.message || "Update failed", classes: 'red' });
    }
  } catch (err) {
    console.error(err);
    M.toast({ html: "Server error", classes: 'red' });
  }
}


async function updateStudentProfile(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("http://localhost:5500/api/student/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      M.toast({ html: data.message, classes: 'green' });
      window.location.href = "student-dashboard.html";
    } else {
      M.toast({ html: data.message || "Update failed", classes: 'red' });
    }
  } catch (err) {
    console.error(err);
    M.toast({ html: "Server error", classes: 'red' });
  }
}

async function fetchAdminEvents() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("adminEventsList");

  if (!container || !token) return;

  try {
    const res = await fetch("http://localhost:5500/api/admin/events", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      container.innerHTML = "<p class='red-text'>Failed to load events.</p>";
      return;
    }

    const events = await res.json();

    if (events.length === 0) {
      container.innerHTML = "<p>No events found.</p>";
    } else {
      events.forEach(event => {
        const card = document.createElement("div");
        card.className = "col s12 m6 l4";

        card.innerHTML = `
          <div class="card z-depth-2">
            <div class="card-content">
              <span class="card-title"><strong>Event: </strong>${event.title}</span>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Location:</strong> ${event.location}</p>
              <p><strong>Created By:</strong> ${event.createdBy}</p>
              <div class="card-action">
              <a href="edit-event.html?id=${event._id}" class="btn btn-sm blue">Edit</a>
              </div>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Fetch admin events error:", error);
    container.innerHTML = "<p class='red-text'>Error loading events.</p>";
  }
}

async function loadStudentRegistrations() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const container = document.getElementById("studentEventsList");

  if (!user || user.role !== "student" || !container) return;

  try {
    const res = await fetch(`http://localhost:5500/api/registrations?email=${user.email}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const registrations = await res.json();

    container.innerHTML = "";

    if (!registrations.length) {
      container.innerHTML = "<p>You haven't registered for any events.</p>";
      return;
    }

    if (registrations.length === 0) {
      container.innerHTML = "<p>You haven't registered for any events.</p>";
      return;
    }

    registrations.forEach(reg => {
      const event = reg.eventId;
      const card = document.createElement("div");
      card.className = "col s12 m6 l4";
      card.innerHTML = `
        <div class="card">
          <div class="card-content">
            <span class="card-title">${event.title}</span>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Phone:</strong> ${reg.phone}</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading registrations:", err);
    container.innerHTML = "<p>Error loading your events.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("student-dashboard.html")) {
    loadStudentRegistrations();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("index.html")) {
    fetchEvents();
  }
});



document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelectorAll('.modal');
  M.Modal.init(modal);

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  if (eventId) {
    loadEvent(eventId);
  }
});

//Get selected event - admin
async function loadEvent(id) {
  const res = await fetch(`http://localhost:5500/api/events/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });
  const event = await res.json();

  document.getElementById("eventTitle").value = event.title;
  document.getElementById("eventDate").value = event.date.split("T")[0];
  document.getElementById("eventLocation").value = event.location;
  M.updateTextFields();
}

//Update selected event - admin
async function updateEvent() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;

  const res = await fetch(`http://localhost:5500/api/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ title, date, location })
  });

  const data = await res.json();
  if (res.ok) {
    M.toast({ html: "Event updated successfully", classes: 'green' });
    setTimeout(() => window.location.href = "admin-dashboard.html", 1500);
  } else {
    M.toast({ html: data.message || "Failed to update", classes: 'red' });
  }
}

function confirmDelete() {
  const modal = M.Modal.getInstance(document.getElementById("deleteModal"));
  modal.open();
}

//Delete selected event - admin
async function deleteEvent() {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  const res = await fetch(`http://localhost:5500/api/events/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();
  if (res.ok) {
    M.toast({ html: "Event deleted", classes: 'green' });
    setTimeout(() => window.location.href = "admin-dashboard.html", 1500);
  } else {
    M.toast({ html: data.message || "Failed to delete", classes: 'red' });
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user?.role === "admin") {
    fetchAdminEvents();
  } else {
    loadStudentRegistrations();
  }
});


async function loadEventDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");
  const container = document.getElementById("eventDetails");

  if (!eventId || !container) return;

  try {
    const res = await fetch(`http://localhost:5500/api/events/${eventId}`);
    const event = await res.json();

    container.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Organized by:</strong> ${event.createdBy}</p>
    `;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.role === "student") {
      eventDetails.style.display = "block";
    }

    // Save for later use (registration)
    localStorage.setItem("selectedEventId", eventId);
  } catch (err) {
    console.error("Error loading event:", err);
    container.innerHTML = "<p class='text-danger'>Failed to load event details.</p>";
  }
}

function goToRegistrationPage() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || user.role !== "student") {
    alert("You must be logged in as a student to register.");
    window.location.href = "student-login.html";
    return;
  }

  const id = localStorage.getItem("selectedEventId");
  if (id) {
    window.location.href = `event-registration.html?id=${id}`;
  }
}


async function submitEventRegistration(e) {
  e.preventDefault();

  const phone = document.getElementById("phone").value;
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!user || !eventId) return;

  try {
    const res = await fetch("http://localhost:5500/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        eventId,
        studentEmail: user.email,
        studentName: user.name,
        phone
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration successful!");
      window.location.href = "student-dashboard.html";
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("Something went wrong. Try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("event-details.html")) {
    loadEventDetailsPage();
  }

  if (window.location.pathname.includes("event-registration.html")) {
    document.getElementById("registrationForm")
      .addEventListener("submit", submitEventRegistration);
  }
});

//Check this if admin display/edit events are affected
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("edit-event.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("id");
    loadEvent(eventId);
  }
});
