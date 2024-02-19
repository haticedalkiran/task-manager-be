const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const Task = require("./models/taskSchema");
const User = require("./models/userSchema");

mongoose.connect("mongodb://localhost:27017/task-manager-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());

const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.end("hello socket");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    User.init();
    const user = await User.findOne({ username, password });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ username, password });
    newUser.save().then(() =>
      res.status(201).json({
        message: "success",
        user: { _id: newUser._id, username: newUser.username },
      })
    );
  } catch (e) {
    res.status(500).json({ message: "error", e });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    User.init();
    const user = await User.findOne({ username, password });

    if (user) {
      res.status(200).json({
        message: "Success",
        user: { _id: user._id, username: user.username },
      });
      return;
    }

    res.status(401).json({ message: "Wrong name or password." });
  } catch (e) {
    res.status(500).json({ message: "Error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    User.init();
    const users = await User.find({});
    res
      .status(200)
      .json(users.map((user) => ({ _id: user._id, username: user.username })));
  } catch (e) {
    console.log("error", e);
    res.status(500).json({ message: e });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  try {
    const tasks = Task.find({});
    tasks.then((data) => {
      socket.emit("receive-tasks", data);
    });
  } catch (error) {
    console.log("error", error);
  }

  socket.on("new-task", (taskData) => {
    console.log("new-task", taskData);
    const task = new Task(taskData);

    task
      .save()
      .then((savedTask) => {
        console.log("savedTask", savedTask);
        io.emit("task-created", savedTask);
      })
      .catch((error) => {});
  });

  socket.on("delete-task", async (taskId) => {
    try {
      await Task.findByIdAndDelete(taskId);
      io.emit("task-deleted", taskId);
    } catch (error) {}
  });

  socket.on("update-task", async (taskData) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(taskData._id, taskData, {
        new: true,
      });
      io.emit("task-updated", updatedTask);
    } catch (error) {}
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
