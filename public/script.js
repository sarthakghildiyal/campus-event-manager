document.addEventListener('DOMContentLoaded', function () {
  M.AutoInit();
});

async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5500/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      M.toast({ html: data.message, classes: 'green' });
      setTimeout(() => window.location.href = "login.html", 1500);
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

  try {
    const res = await fetch("http://localhost:5500/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
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
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      M.toast({ html: data.message || "Failed to reset password", classes: 'red' });
    }
  } catch (err) {
    M.toast({ html: "Server error", classes: 'red' });
    console.error(err);
  }
}

function logout() {
  localStorage.removeItem("token");
  M.toast({ html: "Logged out", classes: 'blue' });
  window.location.href = "index.html";
}

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

  if (nav) {
    nav.innerHTML = token
      ? '<li><a href="create-event.html">Add Event</a></li><li><a href="#" onclick="logout()">Logout</a></li>'
      : '<li><a href="login.html">Login</a></li><li><a href="register.html">Register</a></li>';
  }

  try {
    const res = await fetch("http://localhost:5500/api/events");
    const events = await res.json();
    const eventsContainer = document.getElementById("events");

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
          <div class="card-content">
          <span class="card-title">${event.title}</span>
          <p><i class="material-icons left">event</i>${event.date}</p>
          <p><i class="material-icons left">location_on</i>${event.location}</p>
          </div>`;
        col.appendChild(card);
        eventsContainer.appendChild(col);
      });
    }
  } catch (err) {
    console.error("Failed to fetch events:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadEvents();
});