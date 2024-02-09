const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Task = require("./models/taskSchema");
const { ObjectId } = require("mongodb");

mongoose.connect("mongodb://localhost:27017/task-manager-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let mongooseConn = mongoose.connection;

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

  socket.on("new-task", (task) => {
    mongooseConn.collection("tasks").insertOne(task, (err, res) => {
      if (err) throw err;
      console.log("task added successfully");
    });
    try {
      const tasks = Task.find({});
      tasks.then((data) => {
        socket.broadcast.emit("receive-tasks", data);
      });
    } catch (error) {
      console.log("error", error);
    }
  });

  socket.on("delete-task", (id) => {
    mongooseConn
      .collection("tasks")
      .deleteOne({ _id: new ObjectId(id) }, (err, res) => {
        if (err) throw err;
        console.log("task deleted successfully", res);
        const tasks = Task.find({});
        tasks.then((data) => {
          socket.broadcast.emit("receive-tasks", data);
        });
      });
  });
  socket.on("update-task", (task) => {
    console.log("gelen task", task);
    mongooseConn.collection("tasks").updateOne(
      { _id: new ObjectId(task.id) }, //TODO
      { $set: { ...task } },
      (err, result) => {
        if (err) {
          console.error("Update error:", err);
        } else {
          console.log("Update success:", result);
          const tasks = Task.find({});
          tasks.then((data) => {
            socket.broadcast.emit("receive-tasks", data);
          });
        }
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
