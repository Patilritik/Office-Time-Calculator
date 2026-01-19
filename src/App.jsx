import { Routes, Route, Link } from "react-router-dom";
import TimeCalculator from "./TimeCalculator";
import React from "react";
import ManualTimer from "./ManualTimer";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<TimeCalculator />} />
      <Route path="/manual-timer" element={<ManualTimer />} />
    </Routes>
  );
} 
     

