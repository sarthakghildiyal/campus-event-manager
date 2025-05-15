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

