import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginSignup from "./components/LoginSignup";
import DetailsEntry from "./components/DetailsEntry";
import SetEntry from "./components/SetEntry";
import TableEntry from "./components/TableEntry";

const App = () => {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignup />} />
        <Route
          path="/setentry"
          element={<SetEntry />}
        />
        <Route
          path="/detailsentry"
         element={<DetailsEntry />}
        />
        <Route path="/tableentry" element={<TableEntry />} />
      </Routes>
      
    </Router>
  );
};

export default App;


