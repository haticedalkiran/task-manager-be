const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  detail: String,
  assignee: String,
  dueDate: String,
});

module.exports = mongoose.model("Task", taskSchema);
