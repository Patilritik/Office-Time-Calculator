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

  /* ================= RESTORE ================= */
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

  /* ================= SAVE ================= */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        isWorking,
        isOnBreak,
        inTime,
        sessionAccumulatedMs,
        totalMs,
        eightHourNotified,
        lastUpdatedAt: Date.now(),
      })
    );
  }, [
    isWorking,
    isOnBreak,
    inTime,
    sessionAccumulatedMs,
    totalMs,
    eightHourNotified,
  ]);

  /* ================= LIVE TIMER ================= */
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

  /* ================= ACTIONS ================= */
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

  /* ================= RESET ================= */
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
  <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">

    {/* RESET BUTTON */}
    <button
      onClick={handleReset}
      className="
        fixed top-4 right-4 lg:top-6 lg:right-8 z-50
        bg-white/20 backdrop-blur-md
        px-4 lg:px-5 py-2 rounded-full
        text-xs lg:text-sm font-semibold
        text-white shadow-lg
        hover:bg-white/30 active:scale-95 transition
      "
    >
      Reset Day
    </button>

    {/* PAGE CONTAINER */}
    <div className="
      max-w-6xl mx-auto
      grid grid-cols-1 lg:grid-cols-12
      gap-6 lg:gap-8
      items-stretch
    ">

      {/* LEFT INFO PANEL */}
      <div className="
        lg:col-span-4
        bg-white/15 backdrop-blur-xl
        rounded-3xl
        p-6 lg:p-8
        text-white shadow-xl
      ">
        <h2 className="text-xl lg:text-2xl font-bold mb-5">
          Work Overview
        </h2>

        <div className="space-y-5">
          <div>
            <p className="text-xs lg:text-sm text-white/70">Status</p>
            <p className="text-base lg:text-lg font-semibold">
              {isWorking
                ? isOnBreak
                  ? "On Break ☕"
                  : "Working 💻"
                : "Not Working ❌"}
            </p>
          </div>

          <div>
            <p className="text-xs lg:text-sm text-white/70">
              Total Worked Today
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              {formatTime(totalMs)}
            </p>
          </div>

          <div>
            <p className="text-xs lg:text-sm text-white/70">Target</p>
            <p className="text-base lg:text-lg font-semibold">
              8 Hours
            </p>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs text-white/70">
              Small consistent efforts lead to big success.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN TIMER CARD */}
      <div className="
        lg:col-span-8
        bg-white/20 backdrop-blur-xl
        rounded-[2rem] lg:rounded-[3rem]
        p-6 sm:p-8 lg:p-12
        text-white shadow-2xl relative
      ">

        {/* HEADER */}
        <div className="mb-6 lg:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">
            Office Time Tracker
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-white/70 mt-1">
            Track your productive hours professionally
          </p>
        </div>

        {/* TIMER DISPLAY */}
        <div className="bg-white/20 rounded-3xl py-6 sm:py-8 lg:py-10 text-center mb-6 lg:mb-10">
          <p className="text-xs sm:text-sm text-white/70">
            {isOnBreak ? "Currently On Break" : "Current Session"}
          </p>
          <p className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mt-3">
            {isWorking ? formatTime(liveMs) : "0h 0m 0s"}
          </p>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center bg-white/15 rounded-2xl px-4 sm:px-6 lg:px-8 py-3 lg:py-5 mb-6 lg:mb-10">
          <p className="text-sm lg:text-lg">Total Time Today</p>
          <p className="text-lg lg:text-2xl font-bold">
            {formatTime(totalMs)}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        {!isWorking ? (
          <button
            onClick={handleIn}
            className="
              w-full py-4 lg:py-5
              rounded-2xl
              bg-gradient-to-r from-indigo-400 to-purple-500
              font-semibold
              text-base sm:text-lg lg:text-xl
              shadow-xl
              active:scale-95 transition
            "
          >
            Start Work (IN)
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <button
              onClick={handleOut}
              className="
                py-4 lg:py-5 rounded-2xl
                bg-gradient-to-r from-pink-500 to-rose-500
                font-semibold
                text-base sm:text-lg lg:text-xl
                shadow-lg
                active:scale-95 transition
              "
            >
              Stop Work
            </button>

            {!isOnBreak ? (
              <button
                onClick={handleBreak}
                className="
                  py-4 lg:py-5 rounded-2xl
                  bg-gradient-to-r from-amber-300 to-orange-400
                  text-black font-semibold
                  text-base sm:text-lg lg:text-xl
                  shadow-lg
                  active:scale-95 transition
                "
              >
                Take Break
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="
                  py-4 lg:py-5 rounded-2xl
                  bg-gradient-to-r from-cyan-400 to-blue-500
                  font-semibold
                  text-base sm:text-lg lg:text-xl
                  shadow-lg
                  active:scale-95 transition
                "
              >
                Resume Work
              </button>
            )}
          </div>
        )}

        {/* FOOTER */}
        <p className="text-center text-xs sm:text-sm text-white/60 mt-8 lg:mt-10">
          Crafted with ❤️ by <span className="font-semibold">Ritik Patil</span>
        </p>

        {/* 🎉 POPUP */}
        {showCongrats && (
          <div className="absolute inset-0 bg-black/60 rounded-[2rem] lg:rounded-[3rem] flex items-center justify-center p-4">
            <div className="bg-white text-black rounded-3xl p-6 text-center w-full max-w-xs animate-bounce">
              <h2 className="text-xl font-bold">🎉 Congratulations!</h2>
              <p className="mt-2 text-sm">
                You completed <strong>8 hours</strong> today.
              </p>
              <button
                onClick={() => setShowCongrats(false)}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm"
              >
                Great!
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);



}
