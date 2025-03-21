"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // ✅ Import Firestore
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [authData, setAuthData] = useState({ email: "", password: "" });
  
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    cycleLength: "",
    painLevel: "",
    medications: "",
    lastPeriodDate: "", // ✅ Added last period date
  });

  // ✅ Check Authentication State
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Handle Signup & Login
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        const user = userCredential.user;

        // ✅ Store user details in Firestore
        const userDetails = {
          name: userData.name,
          age: userData.age,
          cycleLength: userData.cycleLength,
          painLevel: userData.painLevel,
          medications: userData.medications,
          lastPeriodDate: userData.lastPeriodDate, // ✅ Store last period date
        };

        await setDoc(doc(db, "users", user.uid), userDetails);
        alert("Signup successful! Your details have been saved.");
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        alert("Login successful!");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Handle Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), userData, { merge: true });
      alert("Profile updated successfully!");
      router.push("/account");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Login & Signup Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-gray-900 p-6 text-gray-300">
        <motion.h1
          className="text-5xl font-bold text-blue-500 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
        >
          {authMode === "login" ? "Login" : "Sign Up"}
        </motion.h1>

        <form onSubmit={handleAuth} className="w-full max-w-md space-y-6">
          <div className="bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-blue-400">
            <div className="space-y-4">
              {authMode === "signup" && (
                <>
                  <div>
                    <label className="block text-blue-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-2">Age</label>
                    <input
                      type="number"
                      value={userData.age}
                      onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-2">Cycle Length (in days)</label>
                    <input
                      type="number"
                      value={userData.cycleLength}
                      onChange={(e) => setUserData({ ...userData, cycleLength: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your cycle length"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-2">Pain Level (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={userData.painLevel}
                      onChange={(e) => setUserData({ ...userData, painLevel: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your pain level"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-2">Medications</label>
                    <input
                      type="text"
                      value={userData.medications}
                      onChange={(e) => setUserData({ ...userData, medications: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your medications"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-400 mb-2">Last Period Date</label>
                    <input
                      type="date"
                      value={userData.lastPeriodDate}
                      onChange={(e) => setUserData({ ...userData, lastPeriodDate: e.target.value })}
                      className="w-full p-3 rounded bg-gray-700 text-white"
                      placeholder="Enter your last period date"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-blue-400 mb-2">Email</label>
                <input
                  type="email"
                  value={authData.email}
                  onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-blue-400 mb-2">Password</label>
                <input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                  className="w-full p-3 rounded bg-gray-700 text-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="mt-6 w-full px-8 py-4 bg-blue-500 text-white rounded-full text-xl font-semibold shadow-lg hover:bg-blue-600 transition duration-300"
              whileTap={{ scale: 0.95 }}
            >
              {authMode === "login" ? "Login" : "Sign Up"}
            </motion.button>

            <p className="text-center mt-4">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-blue-400 hover:text-blue-300"
              >
                {authMode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }

  // ✅ Profile Page
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 p-6 text-gray-300">
      <motion.h1 className="text-5xl font-bold text-blue-500 mb-8">My Profile</motion.h1>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-blue-400">
          <div className="space-y-4">
            <div>
              <label className="block text-blue-400 mb-2">Name</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-blue-400 mb-2">Age</label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your age"
              />
            </div>
            <div>
              <label className="block text-blue-400 mb-2">Cycle Length (in days)</label>
              <input
                type="number"
                value={userData.cycleLength}
                onChange={(e) => setUserData({ ...userData, cycleLength: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your cycle length"
              />
            </div>
            <div>
              <label className="block text-blue-400 mb-2">Pain Level (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={userData.painLevel}
                onChange={(e) => setUserData({ ...userData, painLevel: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your pain level"
              />
            </div>
            <div>
              <label className="block text-blue-400 mb-2">Medications</label>
              <input
                type="text"
                value={userData.medications}
                onChange={(e) => setUserData({ ...userData, medications: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your medications"
              />
            </div>
            <div>
              <label className="block text-blue-400 mb-2">Last Period Date</label>
              <input
                type="date"
                value={userData.lastPeriodDate}
                onChange={(e) => setUserData({ ...userData, lastPeriodDate: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 text-white"
                placeholder="Enter your last period date"
              />
            </div>
          </div>
          <motion.button type="submit" className="mt-6 w-full bg-blue-500 p-3 rounded-full text-white">Save Profile</motion.button>
        </div>
      </form>
      <motion.button onClick={handleLogout} className="mt-8 px-8 py-4 bg-red-600 text-white rounded-full">Logout</motion.button>
    </div>
  );
}
