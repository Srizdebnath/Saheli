"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaHome, FaBatteryThreeQuarters, FaStop, FaHistory, FaInfoCircle } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helpful cramp facts and quotes
const crampFacts = [
  "80% of women experience menstrual cramps during their cycle",
  "Exercise can help reduce cramp intensity by increasing blood flow",
  "Heat therapy can help relax uterine muscles",
  "Staying hydrated may help reduce cramp severity",
  "Deep breathing exercises can help manage cramp discomfort"
];

const motivationalQuotes = [
  "Your pain today is your strength tomorrow",
  "This too shall pass",
  "You are stronger than you know",
  "Listen to your body, but don't let it stop you",
  "Small steps lead to big changes"
];

export default function Session2() {
  const router = useRouter();
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isVibrating, setIsVibrating] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentFact, setCurrentFact] = useState(crampFacts[0]);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  
  // Sensor states
  const [pressure, setPressure] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [vibration, setVibration] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(true);

  // Vibration history for graph
  const [vibrationHistory, setVibrationHistory] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [previousSessions, setPreviousSessions] = useState([]);

  // Rotate facts and quotes periodically
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact(prev => {
        const currentIndex = crampFacts.indexOf(prev);
        return crampFacts[(currentIndex + 1) % crampFacts.length];
      });
    }, 10000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote(prev => {
        const currentIndex = motivationalQuotes.indexOf(prev);
        return motivationalQuotes[(currentIndex + 1) % motivationalQuotes.length];
      });
    }, 15000);

    return () => {
      clearInterval(factInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Vibration Intensity',
        data: vibrationHistory,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/profile');
    }

    // Timer effect
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }

    const ws = new WebSocket('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self');
    
    ws.onopen = () => {
      setIsConnected(true);
      // Send initial configuration
      ws.send(JSON.stringify({ command: 'init', deviceId: user?.uid }));
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Attempt to reconnect
      setTimeout(() => {
        ws.connect();
      }, 3000);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPressure(data.pressure);
      setTemperature(data.temperature);
      setBatteryLevel(data.batteryLevel || batteryLevel);
      
      if (isVibrating && isAutoMode) {
        // Enhanced algorithm for vibration calculation based on menstrual cramp patterns
        const pressureInfluence = Math.min(Math.round(data.pressure / 10), 10);
        const tempInfluence = Math.min(Math.round(data.temperature / 5), 10);
        // Added wave pattern to mimic natural cramp rhythm
        const timeBasedPattern = Math.sin(Date.now() / 1000) * 2;
        const newVibration = Math.round((pressureInfluence * 0.6 + tempInfluence * 0.2 + timeBasedPattern * 0.2));
        
        // Smooth transitions
        const smoothedVibration = Math.round((newVibration + vibration) / 2);
        setVibration(smoothedVibration);
        ws.send(JSON.stringify({ command: 'setVibration', level: smoothedVibration }));
        
        // Update graph data with timestamp
        const now = new Date();
        setVibrationHistory(prev => [...prev, smoothedVibration].slice(-20));
        setTimeLabels(prev => [...prev, now.toLocaleTimeString()].slice(-20));
      }
    };

    return () => {
      ws.close();
      if (interval) clearInterval(interval);
    };
  }, [router, isAutoMode, isVibrating, batteryLevel, isTimerRunning]);

  const handleStartVibration = () => {
    setIsVibrating(true);
    setIsTimerRunning(true);
    const ws = new WebSocket('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self');
    ws.send(JSON.stringify({ command: 'startVibration', mode: isAutoMode ? 'auto' : 'manual' }));
  };

  const handleEmergencyStop = () => {
    setIsVibrating(false);
    setVibration(0);
    setIsTimerRunning(false);
    const ws = new WebSocket('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self');
    ws.send(JSON.stringify({ command: 'emergencyStop' }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");

      if (!duration || duration < 1) {
        throw new Error("Please enter a valid duration");
      }

      const sessionData = {
        duration: parseInt(duration),
        intensity: intensity,
        notes: notes.trim(),
        date: serverTimestamp(),
        actualDuration: sessionTimer,
        sensorData: {
          pressure,
          temperature,
          vibration,
          vibrationHistory,
          maxPressure: Math.max(...vibrationHistory),
          avgPressure: vibrationHistory.reduce((a, b) => a + b, 0) / vibrationHistory.length
        }
      };

      const sessionsRef = collection(db, "users", user.uid, "sessions");
      await addDoc(sessionsRef, sessionData);

      // Reset timer and states
      setSessionTimer(0);
      setIsTimerRunning(false);
      setVibrationHistory([]);
      setTimeLabels([]);

      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-300">
      <div className="absolute top-6 right-6 flex items-center space-x-4">
        <div className={`flex items-center ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          <span className="mr-2">●</span>
          <span>{isConnected ? 'Connected' : 'Disconnecting...'}</span>
        </div>
        <div className="flex items-center text-blue-400">
          <FaBatteryThreeQuarters className="mr-2" />
          <span>{batteryLevel}%</span>
        </div>
        {isTimerRunning && (
          <div className="text-blue-400 font-mono">
            {formatTime(sessionTimer)}
          </div>
        )}
        <motion.button
          className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEmergencyStop}
        >
          <FaStop className="mr-2" />
          Emergency Stop
        </motion.button>
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowTutorial(!showTutorial)}
          className="cursor-pointer"
        >
          <FaInfoCircle className="text-blue-500 text-2xl hover:text-blue-400 transition-colors" />
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
        >
          <FaHome className="text-blue-500 text-3xl hover:text-blue-400 transition-colors" />
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-blue-500 mb-8">Vibration Control</h1>

          {/* Motivational Quote Banner */}
          <motion.div 
            className="bg-blue-500/20 p-4 rounded-lg mb-6 text-center border border-blue-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg italic text-blue-300">{currentQuote}</p>
          </motion.div>

          {/* Cramp Fact Banner */}
          <motion.div 
            className="bg-purple-500/20 p-4 rounded-lg mb-6 text-center border border-purple-400/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm text-purple-300">Did you know? {currentFact}</p>
          </motion.div>

          {/* Tutorial Overlay */}
          {showTutorial && (
            <motion.div 
              className="bg-gray-800/95 p-6 rounded-lg mb-8 border border-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Quick Guide</h3>
              <ul className="space-y-2">
                <li>• Auto mode adjusts vibration based on pressure and temperature</li>
                <li>• Manual mode lets you control vibration intensity directly</li>
                <li>• Emergency stop immediately halts all vibrations</li>
                <li>• Session timer tracks your usage automatically</li>
                <li>• Save your session to track progress over time</li>
                <li>• Heat therapy combined with vibration can provide better relief</li>
                <li>• Take breaks if needed - listen to your body</li>
              </ul>
            </motion.div>
          )}

          {/* Sensor Data and Control Panel */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-blue-400/30">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Real-time Sensor Data</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-blue-300">Pressure</p>
                <p className="text-2xl">{pressure} kPa</p>
              </div>
              <div>
                <p className="text-blue-300">Temperature</p>
                <p className="text-2xl">{temperature}°C</p>
              </div>
              <div>
                <p className="text-blue-300">Vibration</p>
                <p className="text-2xl">{vibration}/10</p>
              </div>
            </div>

            <motion.button
              className={`w-full mb-4 py-3 rounded-lg font-semibold ${
                isVibrating 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isVibrating ? handleEmergencyStop : handleStartVibration}
            >
              {isVibrating ? 'Stop Vibration' : 'Start Vibration'}
            </motion.button>
            
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAutoMode}
                  onChange={(e) => setIsAutoMode(e.target.checked)}
                  className="form-checkbox text-blue-500"
                />
                <span>Auto-adjust vibration based on sensors</span>
              </label>
            </div>

            {!isAutoMode && (
              <div className="mt-4">
                <label className="block text-blue-300 mb-2">Manual Vibration Control</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={vibration}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setVibration(newValue);
                    const ws = new WebSocket('wss://demo.piesocket.com/v3/channel_123?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV&notify_self');
                    ws.send(JSON.stringify({ command: 'setVibration', level: newValue }));
                  }}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-sm text-blue-400">
                  <span>0</span>
                  <span>Current: {vibration}</span>
                  <span>10</span>
                </div>
              </div>
            )}

            {/* Vibration Intensity Graph */}
            <div className="mt-6 bg-gray-900 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-400 mb-4">Vibration Intensity Over Time</h3>
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Session Recording Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg border border-blue-400/30">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Record Session</h2>
            
            <div>
              <label className="block text-blue-300 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-gray-900 rounded-lg p-3 text-white border border-blue-400/30 focus:border-blue-400 focus:outline-none"
                placeholder="Enter duration in minutes"
                min="1"
              />
            </div>

            <div>
              <label className="block text-blue-300 mb-2">Intensity (1-10)</label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-sm text-blue-400">
                <span>1</span>
                <span>Current: {intensity}</span>
                <span>10</span>
              </div>
            </div>

            <div>
              <label className="block text-blue-300 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-900 rounded-lg p-3 text-white border border-blue-400/30 focus:border-blue-400 focus:outline-none"
                placeholder="Add any notes about your session (e.g., pain level, relief effectiveness)"
                rows="4"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg font-semibold
                ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? 'Saving...' : 'Save Session'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
