import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {socket} from "./socket.ts"
import { useState, useEffect } from 'react'
import Nav from "./components/Nav"
import WelcomePage from "./pages/Homepage";
import SecuredPage from "./pages/Securedpage";
// import PrivateRoute from "./helpers/PrivateRoute";


function App() {

 return (
  <div>
      <BrowserRouter>
        {/* <Nav /> */}
        <Routes>
          
          <Route path="/" element={<WelcomePage />} />
          <Route path="/secured" element={<SecuredPage />} />

        </Routes>
      </BrowserRouter>
  </div>
);
}

export default App;