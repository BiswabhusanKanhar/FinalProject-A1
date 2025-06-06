import React from "react";
import Draggable from "react-draggable";
import ScientificCalculator from "./ScientificCalculator"; // Calculator logic
import "./CalculatorModal.css";


const CalculatorModal = ({ onClose }) => {
  return (
    <div className="calculator-overlay">
      <Draggable handle=".calculator-header">
        <div className="calculator-modal">
          <div className="calculator-header">
            <span>Scientific Calculator</span>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
          <ScientificCalculator />
        </div>
      </Draggable>
    </div>
  );
};

export default CalculatorModal;
