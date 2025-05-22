// ====================== AUTH ======================

function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  const exists = users.find(u => u.email === email);
  if (exists) {
    alert("Email already registered.");
    return;
  }

  users.push({ name, email, password, role });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful!");
  window.location.href = "student-login.html";
}

function loginUser(event, expectedRole) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password.");
    return;
  }

  if (user.role !== expectedRole) {
    alert("You are not allowed to login as this role.");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("user", JSON.stringify(user));

  if (expectedRole === "student") {
    window.location.href = "student-dashboard.html";
  } else {
    window.location.href = "admin-dashboard.html";
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("user");
  alert("You have been logged out.");
  window.location.href = "index.html";
}

// ====================== EVENTS ======================

function addEvent(event) {
  event.preventDefault();
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (!currentUser) {
    alert("You must be logged in to create events.");
    return;
  }

  const newEvent = {
    title,
    date,
    location,
    createdByEmail: currentUser.email
  };

  let events = JSON.parse(localStorage.getItem("events")) || [];
  events.push(newEvent);
  localStorage.setItem("events", JSON.stringify(events));

  alert("Event added successfully!");
  window.location.href = "admin-dashboard.html";
}

function renderEvents() {
  const eventsContainer = document.getElementById("events");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const events = JSON.parse(localStorage.getItem("events")) || [];

  const isAdmin = currentUser?.role === "admin";
  eventsContainer.innerHTML = "";

  if (!currentUser) {
    eventsContainer.innerHTML = "<p>Please log in to view events.</p>";
    return;
  }

  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>No events found.</p>";
    return;
  }

  events.forEach((event, index) => {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "card shadow-sm";
    card.style.cursor = "pointer";

    // ✅ Clicking a card saves the selected event and opens event-details.html
    card.onclick = () => {
      localStorage.setItem("selectedEvent", JSON.stringify(event));
      window.location.href = "event-details.html";
    };

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${event.title}</h5>
        <p class="card-text">📅 ${event.date}</p>
        <p class="card-text">📍 ${event.location}</p>
        ${isAdmin ? `
          <button class="btn btn-warning btn-sm me-2" onclick="startEditEvent(${index}); event.stopPropagation();">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEvent(${index}); event.stopPropagation();">Delete</button>
        ` : ''}
      </div>
    `;

    col.appendChild(card);
    eventsContainer.appendChild(col);
  });
}


function deleteEvent(index) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  let events = JSON.parse(localStorage.getItem("events")) || [];

  const userEvents = events.filter(e => e.createdByEmail === currentUser.email);
  const eventToDelete = userEvents[index];

  const fullIndex = events.findIndex(e =>
    e.title === eventToDelete.title &&
    e.date === eventToDelete.date &&
    e.location === eventToDelete.location &&
    e.createdByEmail === currentUser.email
  );

  if (fullIndex !== -1 && confirm("Are you sure you want to delete this event?")) {
    events.splice(fullIndex, 1);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
  }
}

function startEditEvent(index) {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const allEvents = JSON.parse(localStorage.getItem("events")) || [];
  const userEvents = allEvents.filter(e => e.createdByEmail === currentUser.email);

  const eventToEdit = userEvents[index];
  localStorage.setItem("eventToEditIndex", index);
  localStorage.setItem("eventToEdit", JSON.stringify(eventToEdit));

  window.location.href = "edit-event.html";
}

function updateEvent(e) {
  e.preventDefault();
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const eventToEdit = JSON.parse(localStorage.getItem("eventToEdit"));
  const allEvents = JSON.parse(localStorage.getItem("events")) || [];

  const index = allEvents.findIndex(e =>
    e.title === eventToEdit.title &&
    e.date === eventToEdit.date &&
    e.location === eventToEdit.location &&
    e.createdByEmail === currentUser.email
  );

  if (index !== -1) {
    allEvents[index] = { title, date, location, createdByEmail: currentUser.email };
    localStorage.setItem("events", JSON.stringify(allEvents));
    localStorage.removeItem("eventToEdit");
    localStorage.removeItem("eventToEditIndex");
    alert("Event updated successfully!");
    window.location.href = "admin-dashboard.html";
  } else {
    alert("Event not found.");
  }
}

// ====================== EVENT REQUESTS ======================

function submitEventRequest(event) {
  event.preventDefault();
  const title = document.getElementById("eventTitle").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;
  const description = document.getElementById("eventDesc").value;
  const user = JSON.parse(localStorage.getItem("user"));

  const request = {
    title,
    date,
    location,
    description,
    requestedBy: user?.email || "unknown"
  };

  let requests = JSON.parse(localStorage.getItem("eventRequests")) || [];
  requests.push(request);
  localStorage.setItem("eventRequests", JSON.stringify(requests));

  alert("Your request has been sent to the admin.");
  window.location.href = "student-dashboard.html";
}

function renderEventRequests() {
  const container = document.getElementById("requestsContainer");
  let requests = JSON.parse(localStorage.getItem("eventRequests")) || [];

  container.innerHTML = "";

  if (requests.length === 0) {
    container.innerHTML = "<p>No pending requests.</p>";
    return;
  }

  requests.forEach((req, index) => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow";
    card.innerHTML = `
      <div class="card-body">
        <h5>${req.title}</h5>
        <p><strong>Date:</strong> ${req.date}</p>
        <p><strong>Location:</strong> ${req.location}</p>
        <p><strong>Description:</strong> ${req.description || "N/A"}</p>
        <p><strong>Requested By:</strong> ${req.requestedBy}</p>
        <button class="btn btn-success btn-sm me-2" onclick="approveRequest(${index})">Approve</button>
        <button class="btn btn-danger btn-sm" onclick="rejectRequest(${index})">Reject</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function approveRequest(index) {
  let requests = JSON.parse(localStorage.getItem("eventRequests")) || [];
  const approved = requests[index];

  let events = JSON.parse(localStorage.getItem("events")) || [];
  events.push({
    title: approved.title,
    date: approved.date,
    location: approved.location,
    createdByEmail: approved.requestedBy
  });
  localStorage.setItem("events", JSON.stringify(events));

  requests.splice(index, 1);
  localStorage.setItem("eventRequests", JSON.stringify(requests));

  alert("Event approved and added.");
  renderEventRequests();
}

function rejectRequest(index) {
  let requests = JSON.parse(localStorage.getItem("eventRequests")) || [];
  requests.splice(index, 1);
  localStorage.setItem("eventRequests", JSON.stringify(requests));

  alert("Request rejected.");
  renderEventRequests();
}

// ====================== PROFILE HANDLING ======================

function loadUserDetails() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  document.getElementById("userName").value = user.name || "";
  document.getElementById("userEmail").value = user.email || "";
  document.getElementById("userPhone").value = user.phone || "";
}

function saveUserDetails(event) {
  event.preventDefault();
  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.name = document.getElementById("userName").value;
  user.email = document.getElementById("userEmail").value;
  user.phone = document.getElementById("userPhone").value;

  localStorage.setItem("user", JSON.stringify(user));

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) {
    users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }

  alert("Details updated successfully!");
}
