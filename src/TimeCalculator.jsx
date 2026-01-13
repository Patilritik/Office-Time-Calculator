import React, { useState, useEffect } from "react";

const STORAGE_KEY = "office_time_tracker_v1";
const THEME_KEY = "theme_preference";
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

  // Theme state: "light" | "dark" | "system"
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved || "system";
  });

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      if (theme === "dark") {
        root.classList.add("dark");
      } else if (theme === "light") {
        root.classList.remove("dark");
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  // Restore timer data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);
    const now = Date.now();

    setIsWorking(data.isWorking ?? false);
    setIsOnBreak(data.isOnBreak ?? false);
    setTotalMs(data.totalMs || 0);
    setEightHourNotified(data.eightHourNotified || false);

    if (data.isWorking && !data.isOnBreak) {
      const extra = now - (data.lastUpdatedAt || now);
      const restored = (data.sessionAccumulatedMs || 0) + extra;
      setSessionAccumulatedMs(restored);
      setLiveMs(restored);
      setInTime(now);
    } else if (data.isWorking && data.isOnBreak) {
      setSessionAccumulatedMs(data.sessionAccumulatedMs || 0);
      setLiveMs(data.sessionAccumulatedMs || 0);
    }
  }, []);

  // Auto-save timer data
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
  }, [isWorking, isOnBreak, inTime, sessionAccumulatedMs, totalMs, eightHourNotified]);

  // Live timer
  useEffect(() => {
    if (!isWorking || isOnBreak || !inTime) return;

    const interval = setInterval(() => {
      const currentSession = sessionAccumulatedMs + (Date.now() - inTime);
      setLiveMs(currentSession);

      if (!eightHourNotified && totalMs + currentSession >= EIGHT_HOURS) {
        setShowCongrats(true);
        setEightHourNotified(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorking, isOnBreak, inTime, sessionAccumulatedMs, totalMs, eightHourNotified]);

  const handleIn = () => {
    const now = Date.now();
    setInTime(now);
    setIsWorking(true);
    setIsOnBreak(false);
    setSessionAccumulatedMs(0);
    setLiveMs(0);
  };

  const handleOut = () => {
    const now = Date.now();
    const sessionMs = isOnBreak ? sessionAccumulatedMs : sessionAccumulatedMs + (now - inTime);
    setTotalMs((prev) => prev + sessionMs);
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

  const handleReset = () => {
    if (!window.confirm("Reset today's tracked time?")) return;
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
    if (!ms) return "0h 0m 0s";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  const progress = Math.min(100, ((totalMs + liveMs) / EIGHT_HOURS) * 100);
  const isComplete = progress >= 100;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* Controls: Theme + Reset */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {/* <button
          onClick={cycleTheme}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-sm transition"
          title={`Current: ${theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}`}
        >
          {theme === "light" ? "☀️ Light" : theme === "dark" ? "🌙 Dark" : "🔄 System"}
        </button> */}

        <button
          onClick={handleReset}
          className="cursor-pointer px-4 py-2 text-sm font-medium rounded-lg bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-sm transition active:scale-95"
        >
          Reset Day
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 p-6">
              <h2 className="text-xl font-semibold mb-6">Today's Summary</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">Status</p>
                  <p className="text-lg font-medium mt-1">
                    {isWorking ? (
                      isOnBreak ? (
                        <span className="text-amber-600 dark:text-amber-400">On Break ☕</span>
                      ) : (
                        <span className="text-teal-600 dark:text-teal-400">Working</span>
                      )
                    ) : (
                      <span className="text-stone-500 dark:text-stone-400">Not Working</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">Total Worked</p>
                  <p className="text-2xl font-bold mt-1">{formatTime(totalMs)}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">Goal</p>
                  <p className="text-lg font-medium mt-1">8 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 sm:p-8 lg:p-10">
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-bold">Work Time Tracker</h1>
                <p className="text-stone-500 dark:text-stone-400 mt-2">
                  Track your focused hours
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-stone-800 rounded-xl py-10 px-6 text-center mb-10 border border-stone-200 dark:border-stone-700">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                  {isOnBreak ? "On Break" : isWorking ? "Current Session" : "Not Started"}
                </p>
                <div
                  className={`text-5xl sm:text-6xl lg:text-7xl font-mono font-bold tracking-tight ${
                    isComplete ? "text-teal-600 dark:text-teal-400" : ""
                  }`}
                >
                  {isWorking ? formatTime(liveMs) : "— — —"}
                </div>
              </div>

              <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-800 rounded-xl px-6 py-4 mb-10 border border-stone-200 dark:border-stone-700">
                <span className="text-lg">Total Today</span>
                <span className="text-2xl font-bold">{formatTime(totalMs)}</span>
              </div>

              {!isWorking ? (
                <button
                  onClick={handleIn}
                  className="cursor-pointer w-full py-5 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xl shadow-md transition active:scale-[0.98]"
                >
                  Start Work
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleOut}
                    className="cursor-pointer py-5 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xl shadow-md transition active:scale-[0.98]"
                  >
                    End Work
                  </button>

                  {!isOnBreak ? (
                    <button
                      onClick={handleBreak}
                      className="cursor-pointer py-5 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xl shadow-md transition active:scale-[0.98]"
                    >
                      Take Break
                    </button>
                  ) : (
                    <button
                      onClick={handleResume}
                      className="cursor-pointer py-5 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xl shadow-md transition active:scale-[0.98]"
                    >
                      Resume
                    </button>
                  )}
                </div>
              )}

              {/* Updated footer with your name */}
              <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-12">
                Made with focus by Ritik Patil • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Congrats Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-teal-700 dark:text-teal-300">
              Well done! 🎉
            </h2>
            <p className="text-stone-600 dark:text-stone-300 mb-6">
              You’ve completed <strong>8 hours</strong> today.
            </p>
            <button
              onClick={() => setShowCongrats(false)}
              className="cursor-pointer px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
}