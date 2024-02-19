# Real-Time Collaborative Task Manager Backend

This project built with Node.js, Express, Socket.io and MongoDB. It supports user authentication, task CRUD operations and live updates of tasks across clients using WebSocket.

## Frontend Access

To access the frontend repository for the Real-Time Collaborative Task Manager, please visit the following link: [task-manager-fe](https://github.com/haticedalkiran/real-time-collaborative-task-manager)

## API Endpoints

`POST /signup`: Registers a new user.

`POST /login`: Authenticates a user.

`GET /users`: Retrieves a list of users.

WebSocket events for real-time interactions include:

`connection`: Establishes a WebSocket connection.

`new-task`: Emits when a new task is created.

`delete-task`: Emits when a task is deleted.

`update-task`: Emits when a task is updated.

`disconnect`: Handles user disconnection.

## Models
