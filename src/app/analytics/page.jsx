"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push('/profile');
          return;
        }

        const sessionsRef = collection(db, "sessions");
        const q = query(sessionsRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        const sessionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));

        setSessions(sessionData.sort((a, b) => b.timestamp - a.timestamp));
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch session data");
        setLoading(false);
      }
    };

    fetchSessions();
  }, [router]);

  const getFilteredData = () => {
    const now = new Date();
    const filtered = sessions.filter(session => {
      if (!session.timestamp) return false;
      
      switch(timeRange) {
        case "week":
          return now - session.timestamp <= 7 * 24 * 60 * 60 * 1000;
        case "month":
          return now - session.timestamp <= 30 * 24 * 60 * 60 * 1000;
        case "year":
          return now - session.timestamp <= 365 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    return filtered;
  };

  const chartData = {
    labels: getFilteredData().map(session => 
      session.timestamp?.toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Session Intensity',
        data: getFilteredData().map(session => session.intensity),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-500 mb-8">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-blue-500 mb-8">Session Analytics</h1>

          {error && (
            <div className="bg-red-500/20 p-4 rounded-lg mb-6 text-red-300 border border-red-400/30">
              {error}
            </div>
          )}

          <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-blue-400/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-blue-400">Intensity Over Time</h2>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-900 text-white border border-blue-400/30 rounded-lg px-4 py-2"
              >
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
            
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-blue-400/30">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Session History</h2>
            <div className="space-y-4">
              {getFilteredData().map(session => (
                <div key={session.id} className="bg-gray-900 p-4 rounded-lg border border-blue-400/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-300">
                        {session.timestamp?.toLocaleDateString()} at {session.timestamp?.toLocaleTimeString()}
                      </p>
                      <p className="text-lg">Intensity: {session.intensity}/10</p>
                      <p>Duration: {session.duration} minutes</p>
                    </div>
                  </div>
                  {session.notes && (
                    <p className="mt-2 text-gray-400 border-t border-gray-700 pt-2">
                      Notes: {session.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
