const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  _id: String,
  title: String,
  detail: String,
  status: String,
  reporter: String,
  assignee: String,
  dueDate: String,
  createdAt: String,

  updatedAt: String || null,
  updatedBy: String || null,
});

module.exports = mongoose.model("Task", taskSchema);
