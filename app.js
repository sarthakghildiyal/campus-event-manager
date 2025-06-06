const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Event = require("./models/Event");
const Registration = require("./models/Registration");

const app = express();
const PORT = process.env.PORT || 5500;
const JWT_SECRET = process.env.JWT_SECRET;

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.user = user;
    next();
  });
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

app.post("/api/admin-register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error });
  }
});

app.post("/api/student-register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error });
  }
});

app.post("/api/admin-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== "admin")
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    //const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    //res.status(200).json({ message: 'Login successful', token });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
});

app.post("/api/student-login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.role !== "student")
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    //const token = jwt.sign({ email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    //res.status(200).json({ message: 'Login successful', token });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed", error });
  }
});

// //Get all events and load on index.html page
// app.get("/api/events", async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: 1 });
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch events" });
//   }
// });

app.get("/api/events", async (req, res) => {
  try {
    const { location, createdBy, date, title, sort } = req.query;
    const filter = {};

    if (title) filter.title = { $regex: new RegExp(title, "i") };
    if (location) filter.location = { $regex: new RegExp(location, "i") };
    if (createdBy) filter.createdBy = { $regex: new RegExp(createdBy, "i") };
    if (date) filter.date = { $gte: new Date(date) };

    const events = await Event.find(filter).sort({
      date: sort === "desc" ? -1 : 1,
    });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.post("/api/events", authenticateToken, async (req, res) => {
  const { title, date, location, description } = req.body;
  const createdBy = req.user.email;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can create events" });
  }

  try {
    const newEvent = new Event({
      title,
      date,
      location,
      description,
      createdBy,
    });
    await newEvent.save();
    res.status(201).json({ message: "Event created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

app.get(
  "/api/registrations/event/:eventId",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const registrations = await Registration.find({
        eventId: req.params.eventId,
      });
      res.json(registrations);
    } catch (err) {
      console.error("Error fetching registrations for event:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await User.find({ role: "student" }).select("-password");
    res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/admin/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email } = req.body;

    const updated = await User.findOneAndUpdate(
      // current email from token
      { email: req.user.email },
      // updated data
      { name, email },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/student/profile", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email } = req.body;

    const updated = await User.findOneAndUpdate(
      // current email from token
      { email: req.user.email },
      // updated data
      { name, email },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Student profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admin/events", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const events = await Event.find({ createdBy: req.user.email }).sort({
      date: -1,
    });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching admin events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }, "email");
    res.json(admins.map((admin) => admin.email));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin list" });
  }
});

//Admin Get Selected Event
app.get("/api/events/:id", async (req, res) => {
  //Removed authenticateToken from here to make event details public
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//Admin Update Selected Event
app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || req.user.email !== event.createdBy) {
      return res
        .status(403)
        .json({ message: "Not allowed to edit this event" });
    }

    const { title, date, location, description } = req.body;
    event.title = title;
    event.date = date;
    event.location = location;
    event.description = description;
    await event.save();

    res.json({ message: "Event updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//Admin Delete Selected Event
app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || req.user.email !== event.createdBy) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//Register for an event
app.post("/api/registrations", authenticateToken, async (req, res) => {
  try {
    const { eventId, studentEmail, studentName, phone } = req.body;

    const existing = await Registration.findOne({ eventId, studentEmail });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already registered for this event." });
    }

    const reg = new Registration({
      eventId,
      studentEmail,
      studentName,
      phone,
      registeredAt: new Date(),
    });

    await reg.save();
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Get registered events for a student
app.get("/api/registrations", authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;

    if (req.user.role !== "student" || req.user.email !== email) {
      return res.status(403).json({ message: "Access denied" });
    }

    const registrations = await Registration.find({
      studentEmail: email,
    }).populate("eventId");
    res.json(registrations);
  } catch (err) {
    console.error("Error fetching registrations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
