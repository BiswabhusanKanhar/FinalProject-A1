import React, { createContext, useState } from "react";

const ExamContext = createContext();

const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([
    {
      id: 1,
      name: "GATE - Computer Science (CS)",
      description: "GATE exam for Computer Science and Information Technology.",
      eligibility: "Bachelor’s degree in Engineering or Science",
      examMode: "Online (CBT)",
      difficulty: "Moderate to High",
      details: {
        syllabus: {
          link: "https://gate2025.iisc.ac.in/cs-syllabus",
          description: "Official GATE CS Syllabus 2025"
        },
        rules: {
          link: "https://gate2025.iisc.ac.in/rules",
          description: "GATE Exam Rules and Guidelines"
        },
        notesMaterials: {
          notesLink: "https://example.com/gate-cs-notes",
          materialLink: "https://example.com/gate-cs-study-material",
          books: "Introduction to Algorithms by Cormen, Operating Systems by Galvin"
        }
      }
    },
    {
      id: 2,
      name: "GATE - Electronics and Communication (EC)",
      description: "GATE exam for Electronics and Communication Engineering.",
      eligibility: "Bachelor’s degree in Engineering or Science",
      examMode: "Online (CBT)",
      difficulty: "Moderate to High",
      details: {
        syllabus: {
          link: "https://gate2025.iisc.ac.in/ec-syllabus",
          description: "Official GATE EC Syllabus 2025"
        },
        rules: {
          link: "https://gate2025.iisc.ac.in/rules",
          description: "GATE Exam Rules and Guidelines"
        },
        notesMaterials: {
          notesLink: "https://example.com/gate-ec-notes",
          materialLink: "https://example.com/gate-ec-study-material",
          books: "Microelectronic Circuits by Sedra, Signals and Systems by Oppenheim"
        }
      }
    },
    {
      id: 3,
      name: "GATE - Mechanical Engineering (ME)",
      description: "GATE exam for Mechanical Engineering.",
      eligibility: "Bachelor’s degree in Engineering or Science",
      examMode: "Online (CBT)",
      difficulty: "Moderate to High",
      details: {
        syllabus: {
          link: "https://gate2025.iisc.ac.in/me-syllabus",
          description: "Official GATE ME Syllabus 2025"
        },
        rules: {
          link: "https://gate2025.iisc.ac.in/rules",
          description: "GATE Exam Rules and Guidelines"
        },
        notesMaterials: {
          notesLink: "https://example.com/gate-me-notes",
          materialLink: "https://example.com/gate-me-study-material",
          books: "Engineering Mechanics by Beer, Thermodynamics by Cengel"
        }
      }
    },
    {
      id: 4,
      name: "GATE Mock Test - CS",
      description: "Practice mock test for GATE Computer Science.",
      eligibility: "Any registered candidate",
      examMode: "Online (Simulated CBT)",
      difficulty: "Moderate",
      details: {
        syllabus: {
          link: "https://gate2025.iisc.ac.in/cs-syllabus",
          description: "Official GATE CS Syllabus 2025"
        },
        rules: {
          link: "https://gate2025.iisc.ac.in/rules",
          description: "GATE Exam Rules and Guidelines"
        },
        notesMaterials: {
          notesLink: "https://example.com/gate-cs-notes",
          materialLink: "https://example.com/gate-cs-study-material",
          books: "Introduction to Algorithms by Cormen, Operating Systems by Galvin"
        }
      }
    }
    // Add more exams as needed
  ]);

  return <ExamContext.Provider value={{ exams, setExams }}>{children}</ExamContext.Provider>;
};

export { ExamContext, ExamProvider };