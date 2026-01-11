import React, { useState, useEffect } from "react";

const STORAGE_KEY = "office_time_tracker_v1";
const EIGHT_HOURS = 8 * 60 * 60 * 1000;

export default function TimeCalculator() {
  const [isWorking, setIsWorking] = useState(false);
  const [inTime, setInTime] = useState(null);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [sessionAccumulatedMs, setSessionAccumulatedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [liveMs, setLiveMs] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [eightHourNotified, setEightHourNotified] = useState(false);

  /* ---------------- RESTORE ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    const now = Date.now();

    setIsWorking(data.isWorking);
    setIsOnBreak(data.isOnBreak);
    setTotalMs(data.totalMs || 0);
    setEightHourNotified(data.eightHourNotified || false);

    if (data.isWorking) {
      if (data.isOnBreak) {
        setSessionAccumulatedMs(data.sessionAccumulatedMs || 0);
        setLiveMs(data.sessionAccumulatedMs || 0);
      } else {
        const extra = now - data.lastUpdatedAt;
        const restored =
          (data.sessionAccumulatedMs || 0) + extra;

        setSessionAccumulatedMs(restored);
        setInTime(now);
        setLiveMs(restored);
      }
    }
  }, []);

  /* ---------------- SAVE ---------------- */
  useEffect(() => {
    const payload = {
      isWorking,
      isOnBreak,
      inTime,
      sessionAccumulatedMs,
      totalMs,
      eightHourNotified,
      lastUpdatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    isWorking,
    isOnBreak,
    inTime,
    sessionAccumulatedMs,
    totalMs,
    eightHourNotified,
  ]);

  /* ---------------- LIVE TIMER ---------------- */
  useEffect(() => {
    let interval;
    if (isWorking && !isOnBreak && inTime) {
      interval = setInterval(() => {
        const currentSession =
          sessionAccumulatedMs + (Date.now() - inTime);

        setLiveMs(currentSession);

        if (
          !eightHourNotified &&
          totalMs + currentSession >= EIGHT_HOURS
        ) {
          setShowCongrats(true);
          setEightHourNotified(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [
    isWorking,
    isOnBreak,
    inTime,
    sessionAccumulatedMs,
    totalMs,
    eightHourNotified,
  ]);

  /* ---------------- ACTIONS ---------------- */
  const handleIn = () => {
    setInTime(Date.now());
    setIsWorking(true);
    setIsOnBreak(false);
    setSessionAccumulatedMs(0);
    setLiveMs(0);
  };

  const handleOut = () => {
    const now = Date.now();
    const sessionMs = isOnBreak
      ? sessionAccumulatedMs
      : sessionAccumulatedMs + (now - inTime);

    setTotalMs(prev => prev + sessionMs);
    setIsWorking(false);
    setIsOnBreak(false);
    setSessionAccumulatedMs(0);
    setLiveMs(0);
    setInTime(null);
  };

  const handleBreak = () => {
    const now = Date.now();
    const accumulated = sessionAccumulatedMs + (now - inTime);
    setSessionAccumulatedMs(accumulated);
    setLiveMs(accumulated);
    setIsOnBreak(true);
    setInTime(null);
  };

  const handleResume = () => {
    setInTime(Date.now());
    setIsOnBreak(false);
  };

  /* ---------------- RESET ---------------- */
  const handleReset = () => {
    if (!window.confirm("Reset today's work time?")) return;

    setIsWorking(false);
    setIsOnBreak(false);
    setInTime(null);
    setSessionAccumulatedMs(0);
    setLiveMs(0);
    setTotalMs(0);
    setEightHourNotified(false);
    setShowCongrats(false);

    localStorage.removeItem(STORAGE_KEY);
  };

  const formatTime = (ms) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
      <div className="relative w-full max-w-sm bg-white/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 text-white">

        {/* Reset Button */}
        {/* <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30"
        >
          Reset
        </button> */}

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Work Time Tracker</h1>
          <p className="text-sm text-white/80">
            Stay consistent, stay productive
          </p>
        </div>

        {/* Timer */}
        <div className="bg-white/20 rounded-3xl py-6 text-center mb-5">
          <p className="text-sm text-white/70">
            {isOnBreak ? "On Break" : "Current Session"}
          </p>
          <p className="text-4xl font-extrabold mt-2">
            {isWorking ? formatTime(liveMs) : "0h 0m 0s"}
          </p>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center bg-white/15 rounded-2xl px-4 py-3 mb-6">
          <p className="text-sm">Total Worked</p>
          <p className="text-lg font-semibold">
            {formatTime(totalMs)}
          </p>
        </div>

        {/* Buttons */}
        {!isWorking ? (
          <button
            onClick={handleIn}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-400 to-purple-500 font-semibold text-lg shadow-lg active:scale-95"
          >
            IN
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleOut}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 font-semibold text-lg shadow-lg active:scale-95"
            >
              OUT
            </button>

            {!isOnBreak ? (
              <button
                onClick={handleBreak}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 text-black shadow-md active:scale-95"
              >
                Take Break
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md active:scale-95"
              >
                Resume Work
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-white/70 mt-6">
          Crafted with ❤️ by <span className="font-semibold">Ritik Patil</span>
        </p>

        {/* 🎉 Popup */}
        {showCongrats && (
          <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center">
            <div className="bg-white text-black rounded-3xl p-6 text-center w-72 animate-bounce">
              <h2 className="text-2xl font-bold">😊 Congrats!</h2>
              <p className="mt-2 text-sm">
                You’ve completed <strong>8 hours</strong> of work today!
              </p>
              <button
                onClick={() => setShowCongrats(false)}
                className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-xl"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
