import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const ExamContext = createContext();

const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found, cannot fetch exams.");
          return;
        }

        const apiUrl = "http://localhost:5001";
        const response = await axios.get(`${apiUrl}/exams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExams(response.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    };

    fetchExams();
  }, []);

  return (
    <ExamContext.Provider value={{ exams, setExams }}>
      {children}
    </ExamContext.Provider>
  );
};

export { ExamContext, ExamProvider };