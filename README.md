# DrawBoard

DrawBoard is a full-stack whiteboard web application that allows users to create sketches with a hand-drawn, sketchy appearance. This collaborative app is built with **React**, **Rough.js**, **Socket.IO**, and **Firebase**, featuring real-time drawing synchronization, undo/redo functionality, and Google OAuth authentication.

## Features

- **Sketchy Drawing**: Utilizes Rough.js to create drawings with a hand-drawn, artistic style.
- **Collaborative Drawing**: Multiple users can draw on the board simultaneously (powered by Socket.IO for real-time updates).
- **Persistent Storage**: Firebase stores each drawing stroke, ensuring users can revisit and continue their drawings.
- **Undo/Redo Functionality**: Supports undo and redo actions for enhanced drawing control.
- **Google OAuth Authentication**: Secure login for users to access and save their drawings.

## Tech Stack

- **Frontend**: React, Rough.js
- **Backend**: Node.js, Socket.IO
- **Database**: Firebase
- **Authentication**: Google OAuth

## Installation

### Prerequisites

- Node.js and npm installed on your system
- Firebase account and project setup

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/aryankarma/DrawBoard.git
   cd DrawBoard

2. **Install dependencies**:

   ```bash
   npm install

3. **Run the app**:

   ```bash
   npm start

- The app will run locally at http://localhost:3000.
