import React, { useState } from "react";
import "./CalculatorModal.css";

const ScientificCalculator = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("0");
  const [mode, setMode] = useState("DEG"); // DEG or RAD

  const toRadians = (deg) => deg * (Math.PI / 180);
  const toDegrees = (rad) => rad * (180 / Math.PI);

  const append = (val) => {
    try {
      switch (val) {
        case "π":
          setExpression((prev) => prev + Math.PI);
          break;
        case "e":
          setExpression((prev) => prev + Math.E);
          break;
        case "n!":
          const num = parseFloat(expression);
          if (isNaN(num) || num < 0) throw new Error();
          const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
          setResult(fact(num));
          break;
        case "xʸ":
          setExpression((prev) => prev + "**");
          break;
        case "√x":
          setExpression((prev) => `Math.sqrt(${prev})`);
          break;
        case "∛x":
          setExpression((prev) => `Math.cbrt(${prev})`);
          break;
        case "log":
          setExpression((prev) => `Math.log10(${prev})`);
          break;
        case "ln":
          setExpression((prev) => `Math.log(${prev})`);
          break;
        case "log₂x":
          setExpression((prev) => `Math.log2(${prev})`);
          break;
        case "logₓ":
          setExpression((prev) => `Math.log(${prev})/Math.log(x)`); // replace 'x'
          break;
        case "eˣ":
          setExpression((prev) => `Math.exp(${prev})`);
          break;
        case "10ˣ":
          setExpression((prev) => `Math.pow(10, ${prev})`);
          break;
        case "1/x":
          setExpression((prev) => `1/(${prev})`);
          break;
        case "|x|":
          setExpression((prev) => `Math.abs(${prev})`);
          break;
        case "sin":
          setExpression((prev) => `Math.sin(${mode === "DEG" ? toRadians(eval(prev)) : eval(prev)})`);
          break;
        case "cos":
          setExpression((prev) => `Math.cos(${mode === "DEG" ? toRadians(eval(prev)) : eval(prev)})`);
          break;
        case "tan":
          setExpression((prev) => `Math.tan(${mode === "DEG" ? toRadians(eval(prev)) : eval(prev)})`);
          break;
        case "sin⁻¹":
          setExpression((prev) => {
            const val = Math.asin(eval(prev));
            return `${mode === "DEG" ? toDegrees(val) : val}`;
          });
          break;
        case "cos⁻¹":
          setExpression((prev) => {
            const val = Math.acos(eval(prev));
            return `${mode === "DEG" ? toDegrees(val) : val}`;
          });
          break;
        case "tan⁻¹":
          setExpression((prev) => {
            const val = Math.atan(eval(prev));
            return `${mode === "DEG" ? toDegrees(val) : val}`;
          });
          break;
        case "+/-":
          setExpression((prev) => (prev.startsWith("-") ? prev.slice(1) : "-" + prev));
          break;
        case "←":
          setExpression((prev) => prev.slice(0, -1));
          break;
        case "C":
          setExpression("");
          setResult("0");
          break;
        case "=":
          evaluate();
          break;
        default:
          setExpression((prev) => prev + val);
      }
    } catch {
      setResult("Error");
    }
  };

  const evaluate = () => {
    try {
      // eslint-disable-next-line no-eval
      const evalResult = eval(expression);
      setResult(evalResult);
    } catch {
      setResult("Error");
    }
  };

  const buttons = [
    ["π", "e", "n!", "xʸ", "√x", "∛x", "←"],
    ["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "C"],
    ["log", "ln", "log₂x", "logₓ", "eˣ", "10ˣ", "1/x"],
    ["(", ")", "+/-", "|x|", "/", "*", "-"],
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    ["0", ".", "+", "="],
  ];

  return (
    <div className="calc-body">
      <input className="calc-screen" type="text" value={expression} readOnly /><br/>
      <input className="calc-screen result" type="text" value={result} readOnly />

      {/* Deg/Rad toggle */}
      <div className="toggle-mode">
        <label>
          <input
            type="radio"
            name="angleMode"
            value="DEG"
            checked={mode === "DEG"}
            onChange={() => setMode("DEG")}
          />
          Deg
        </label>
        <label>
          <input
            type="radio"
            name="angleMode"
            value="RAD"
            checked={mode === "RAD"}
            onChange={() => setMode("RAD")}
          />
          Rad
        </label>
      </div>

      <div className="calc-buttons">
        {buttons.map((row, i) => (
          <div className="calc-row" key={i}>
            {row.map((btn) => (
              <button
                key={btn}
                className={btn === "=" ? "btn-equal" : ""}
                onClick={() => append(btn)}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScientificCalculator;
