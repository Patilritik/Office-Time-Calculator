import React, { useState } from 'react';
import backIcon from './assets/back-icon-1.png';

const ManualTimer = () => {
  const [inHour, setInHour] = useState('12');
  const [inMinute, setInMinute] = useState('00');
  const [inSecond, setInSecond] = useState('00');
  const [inPeriod, setInPeriod] = useState('AM');

  const [outHour, setOutHour] = useState('12');
  const [outMinute, setOutMinute] = useState('00');
  const [outSecond, setOutSecond] = useState('00');
  const [outPeriod, setOutPeriod] = useState('AM');

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutesSeconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const calculateDuration = () => {
    setError('');
    setResult(null);

    // Convert 12-hour → 24-hour
    let inH = parseInt(inHour, 10);
    if (inPeriod === 'PM' && inH !== 12) inH += 12;
    if (inPeriod === 'AM' && inH === 12) inH = 0;

    let outH = parseInt(outHour, 10);
    if (outPeriod === 'PM' && outH !== 12) outH += 12;
    if (outPeriod === 'AM' && outH === 12) outH = 0;

    // Total seconds since midnight
    const inTotalSeconds  = inH  * 3600 + parseInt(inMinute, 10) * 60 + parseInt(inSecond, 10);
    const outTotalSeconds = outH * 3600 + parseInt(outMinute, 10) * 60 + parseInt(outSecond, 10);

    let diffSeconds = outTotalSeconds - inTotalSeconds;

    // Next day if negative
    if (diffSeconds < 0) diffSeconds += 24 * 3600;

    if (diffSeconds <= 0) {
      setError('Out time must be after In time');
      return;
    }

    const hours   = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    setResult({ hours, minutes, seconds });
  };

  const handleClear = () => {
    setInHour('12');   setInMinute('00');   setInSecond('00');   setInPeriod('AM');
    setOutHour('12');  setOutMinute('00');  setOutSecond('00');  setOutPeriod('AM');
    setResult(null);
    setError('');
  };

  const TimeSelect = ({ 
    label, 
    hour, setHour, 
    minute, setMinute, 
    second, setSecond, 
    period, setPeriod 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
        {label}
      </label>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Hour */}
        <select
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="cursor-pointer w-16 sm:w-20 px-2 sm:px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <span className="text-xl font-medium">:</span>

        {/* Minute */}
        <select
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          className="cursor-pointer w-16 sm:w-20 px-2 sm:px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          {minutesSeconds.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <span className="text-xl font-medium">:</span>

        {/* Second */}
        <select
          value={second}
          onChange={(e) => setSecond(e.target.value)}
          className="cursor-pointer w-16 sm:w-20 px-2 sm:px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          {minutesSeconds.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* AM / PM */}
        <div className="flex border border-stone-300 dark:border-stone-700 rounded-lg overflow-hidden ml-1 sm:ml-3">
          <button
            type="button"
            onClick={() => setPeriod('AM')}
            className={`cursor-pointer px-3 sm:px-4 py-2.5 text-sm font-medium transition ${
              period === 'AM'
                ? 'bg-teal-600 text-white'
                : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => setPeriod('PM')}
            className={`cursor-pointer px-3 sm:px-4 py-2.5 text-sm font-medium transition ${
              period === 'PM'
                ? 'bg-teal-600 text-white'
                : 'bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Manual Time Entry</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Enter check-in and check-out times (12-hour format)
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-6 md:p-10">
          <div className="space-y-8 mb-10 max-w-md mx-auto">
            <TimeSelect
              label="In Time"
              hour={inHour}       setHour={setInHour}
              minute={inMinute}   setMinute={setInMinute}
              second={inSecond}   setSecond={setInSecond}
              period={inPeriod}   setPeriod={setInPeriod}
            />

            <TimeSelect
              label="Out Time"
              hour={outHour}      setHour={setOutHour}
              minute={outMinute}  setMinute={setOutMinute}
              second={outSecond}  setSecond={setOutSecond}
              period={outPeriod}  setPeriod={setOutPeriod}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={calculateDuration}
              className="cursor-pointer px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition active:scale-[0.98]"
            >
              Calculate Duration
            </button>

            <button
              onClick={handleClear}
              className="cursor-pointer px-10 py-4 bg-stone-600 hover:bg-stone-700 text-white font-semibold rounded-xl shadow-md transition active:scale-[0.98]"
            >
              Clear
            </button>
          </div>

          {error && (
            <p className="mt-6 text-center text-rose-600 dark:text-rose-400 font-medium">
              {error}
            </p>
          )}

          {result && (
            <div className="mt-10 p-6 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-lg text-stone-600 dark:text-stone-300 mb-3">
                Duration Worked:
              </p>
              <div className="text-4xl sm:text-5xl font-bold font-mono text-teal-600 dark:text-teal-400 tracking-tight">
                {result.hours}h {result.minutes.toString().padStart(2, '0')}m {result.seconds.toString().padStart(2, '0')}s
              </div>
              <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
                ({result.hours} hours, {result.minutes} minutes, {result.seconds} seconds)
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => window.history.back()}
            className="cursor-pointer px-8 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-medium transition"
          >
           ← Back to Tracker
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualTimer;