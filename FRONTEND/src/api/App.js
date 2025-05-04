import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import ExamDetails from "../pages/ExamDetails";
import { ExamProvider } from "../context/ExamContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AuthPage from "../pages/AuthPage";
import MockExam from "../components/MockExam/Exam";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // useEffect(() => {
  //   const timer = setTimeout(() => setShowSplash(false), 3000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <ExamProvider>
      <Router>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exam/:id" element={<ExamDetails />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/mock" element={<MockExam />}/>
          </Routes>

      </Router>
    </ExamProvider>
  );
}

export default App;