"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import Link from "next/link";
import moment from 'moment';

export default function Account() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPeriodDate, setNextPeriodDate] = useState(null);

  const periodTips = [
    "Stay hydrated! Drink plenty of water throughout the day 💧",
    "Try gentle yoga or stretching exercises 🧘‍♀️", 
    "Apply a heating pad to your lower abdomen 🔥",
    "Take warm baths to help relieve cramps 🛁",
    "Practice deep breathing exercises for relaxation 🌬️",
    "Eat foods rich in omega-3 fatty acids 🥑",
    "Get adequate rest and sleep 😴",
    "Try herbal teas like chamomile or ginger 🫖"
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      
      if (!user) {
        router.push('/profile');
        return;
      }

      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          // Calculate next period starting date
          const lastPeriodStartDate = moment(userData.lastPeriodStartDate); // Use moment to parse
          const cycleLength = userData.cycleLength;
          const nextPeriod = lastPeriodStartDate.clone().add(cycleLength, 'days'); // Clone to avoid mutation
          setNextPeriodDate(nextPeriod.toDate()); 
        }

        // Fetch session history
        const sessionsRef = collection(db, "users", user.uid, "sessions");
        const q = query(sessionsRef, orderBy("date", "desc"));
        const sessionSnap = await getDocs(q);
        
        const sessionData = [];
        sessionSnap.forEach((doc) => {
          sessionData.push({ id: doc.id, ...doc.data() });
        });
        setSessions(sessionData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-blue-500 text-2xl">Loading...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-2xl">Please log in to view your account.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-gray-300 relative">
      {/* Home Icon */}
      <motion.div 
        className="absolute top-6 right-6 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/')}
      >
        <FaHome className="text-blue-500 text-3xl hover:text-blue-400 transition-colors" />
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-blue-500 mb-8">Account Overview</h1>

          {/* User Profile Section */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border-2 border-blue-400">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-blue-300">Name</p>
                <p className="text-xl">{userData.name}</p>
              </div>
              <div>
                <p className="text-blue-300">Age</p>
                <p className="text-xl">{userData.age}</p>
              </div>
              <div>
                <p className="text-blue-300">Cycle Length</p>
                <p className="text-xl">{userData.cycleLength} days</p>
              </div>
              <div>
                <p className="text-blue-300">Pain Level</p>
                <p className="text-xl">{userData.painLevel}/10</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-blue-300">Medications</p>
                <p className="text-xl">{userData.medications || "None listed"}</p>
              </div>
            </div>
          </div>

          {/* Session History Section */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border-2 border-blue-400">
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Session History</h2>
            {sessions.length === 0 ? (
              <p className="text-gray-400">No previous sessions recorded.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div 
                    key={session.id} 
                    className="bg-gray-700 p-4 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-300">Date</p>
                        <p>{new Date(session.date?.toDate()).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-blue-300">Duration</p>
                        <p>{session.duration} minutes</p>
                      </div>
                      <div>
                        <p className="text-blue-300">Intensity</p>
                        <p>{session.intensity}/10</p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-2">
                        <p className="text-blue-300">Notes</p>
                        <p className="text-sm">{session.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Next Period Date Section */}
          {nextPeriodDate && (
  <div className="bg-gray-800 rounded-xl p-6 mb-8 border-2 border-blue-400">
    <h2 className="text-2xl font-semibold text-blue-400 mb-4">Next Period Starting Date</h2>
    <p>{moment(nextPeriodDate).format('MMMM DD, YYYY')}</p> {/* Format with Moment.js */}
  </div>
)}

          {/* Let's Have a Session Button */}
          <div className="flex justify-center mb-8">
            <Link href="/session2">
              <motion.button
                className="px-12 py-6 bg-blue-500 text-white rounded-full text-2xl font-semibold shadow-lg hover:bg-blue-600 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Session Now
              </motion.button>
            </Link>
          </div>

          {/* Wellness Tips Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-blue-400 mb-4">Wellness Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {periodTips.map((tip, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-blue-400/20 to-purple-400/20 p-4 rounded-xl backdrop-blur-sm border border-blue-400/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <p className="text-white text-sm">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
