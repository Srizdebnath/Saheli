"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { database, ref, onValue, set } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaUserCircle, FaInstagram, FaLinkedin, FaGithub, FaChartLine, FaInfoCircle, FaTimes } from 'react-icons/fa';

export default function Home() {
  const [sensorData, setSensorData] = useState({ pressure: 0, temperature: 0 });
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [manualVibration, setManualVibration] = useState(false);
  const [history, setHistory] = useState([]);
  const [showTeam, setShowTeam] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedTerm, setExpandedTerm] = useState(null);

  const didYouKnow = [
    "80% of women experience period pain at some point",
    "Exercise can help reduce menstrual cramps",
    "Heat therapy is proven to help with period pain", 
    "Staying hydrated can reduce bloating",
    "Omega-3 fatty acids may help reduce cramps"
  ];

  const faqs = [
    {
      question: "Is Saheli safe to use?",
      answer: "Yes, Saheli is completely safe. It uses non-invasive technology and is drug-free, making it suitable for regular use during menstruation."
    },
    {
      question: "How long should I use Saheli per session?",
      answer: "We recommend using Saheli for 15-30 minutes per session for optimal results. You can have multiple sessions throughout the day as needed."
    },
    {
      question: "Can I use Saheli while sleeping?",
      answer: "We don't recommend using Saheli while sleeping. The device works best when you can adjust settings based on your comfort level."
    },
    {
      question: "Is Saheli waterproof?",
      answer: "Saheli is water-resistant but not fully waterproof. Please avoid submerging the device in water or using it in the shower."
    },
    {
      question: "How often should I charge Saheli?",
      answer: "For best performance, we recommend charging Saheli after every 2-3 sessions. A full charge typically lasts for about 4-5 hours of active use."
    }
  ];

  const terms = [
    {
      title: "External Use Only",
      description: "Saheli is designed for external use only. Do not insert or apply internally."
    },
    {
      title: "16+ Years Only (Gurdians consent for below 16 years)",
      description: "This device is intended for users 16 years of age or older."
    },
    {
      title: "Consult Healthcare Provider",
      description: "If you have any medical conditions or concerns, please consult with your healthcare provider before using Saheli."
    },
    {
      title: "Not Liable for Misuse",
      description: "We are not responsible for any injuries or damages resulting from improper use of the device."
    },
    {
      title: "Data Privacy",
      description: "Your usage data is collected solely for improving your experience and is never shared with third parties without consent."
    }
  ];

  useEffect(() => {
    const sensorRef = ref(database, "sensorData");
    onValue(sensorRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorData(snapshot.val());
      }
    });

    const vibrationRef = ref(database, "vibrationLevel");
    onValue(vibrationRef, (snapshot) => {
      if (snapshot.exists()) {
        setVibrationLevel(snapshot.val());
      }
    });

    const historyRef = ref(database, "history");
    onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        setHistory(Object.values(snapshot.val()));
      }
    });
  }, []);

  const handleManualVibration = async () => {
    setManualVibration(!manualVibration);
    const level = manualVibration ? 0 : 50;
    await set(ref(database, "vibrationLevel"), level);
  };

  const toggleTeam = () => {
    setShowTeam(!showTeam);
  };

  const toggleFaq = (index) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const toggleTerm = (index) => {
    if (expandedTerm === index) {
      setExpandedTerm(null);
    } else {
      setExpandedTerm(index);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 p-6 font-sans text-white relative">
      <div className="w-full flex justify-between items-center mb-8">
        <div></div> {/* Empty div for spacing */}
        <div className="flex gap-4">
          <Link href="/analytics">
            <motion.div
              className="p-3 bg-blue-500 rounded-full text-white shadow-lg hover:bg-blue-600 transition duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaChartLine size={24} />
            </motion.div>
          </Link>
          <Link href="/profile">
            <motion.div
              className="p-3 bg-blue-500 rounded-full text-white shadow-lg hover:bg-blue-600 transition duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUserCircle size={24} />
            </motion.div>
          </Link>
          <motion.div
            className="p-3 bg-blue-500 rounded-full text-white shadow-lg hover:bg-blue-600 transition duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTeam}
          >
            <FaInfoCircle size={24} />
          </motion.div>
        </div>
      </div>

      <div className="text-center mb-12">
        <motion.h1 
          className="text-7xl font-extrabold text-blue-400 mb-4 drop-shadow-lg font-['Playfair_Display']"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
        >
          Saheli
        </motion.h1>
        <motion.p
          className="text-2xl text-blue-300 italic font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Be Modern, Be Healthy
        </motion.p>
      </div>

      {/* Did You Know Section */}
      <div className="w-full mb-16">
        <motion.h2 
          className="text-4xl font-bold text-blue-400 mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Did You Know?
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-6">
          {didYouKnow.map((fact, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-full shadow-lg border-2 border-blue-400/30 max-w-[250px]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            >
              <p className="text-blue-300 text-center font-medium">{fact}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
        {/* What is Saheli? */}
        <motion.div 
          className="bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl border-blue-400/30 border-2 h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-4xl font-semibold text-blue-400 font-['Montserrat']">💡 What is Saheli?</h2>
          <p className="text-gray-300 mt-4 font-['Poppins'] leading-relaxed text-lg">Saheli Menstrual Pain Relief device is your 100% Non-invasive and Drug-free Solution for Period Pain Relief, Where Cutting-edge Technology Converges with Style, Comfort and Contemporary Elegance. Say goodbye to bulky, uncomfortable solutions and step into an empowering world with Saheli.</p>
        </motion.div>

        {/* How to Use It */}
        <motion.div 
          className="bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl border-blue-400/30 border-2 h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-4xl font-semibold text-blue-400 font-['Montserrat']">🛠️ How to Use It</h2>
          <ul className="text-gray-300 mt-4 list-disc pl-5 font-['Poppins'] leading-relaxed text-lg">
            <li>Wear It - Secure the device on the affected area.</li>
            <li>Power It - Turn on the device and ensure connectivity.</li>
            <li>Relax - Let the automated pain relief system do its magic.</li>
          </ul>
        </motion.div>

        {/* Usage Tips Section */}
        <motion.div 
          className="bg-gray-800/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl border-blue-400/30 border-2 h-full"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-4xl font-semibold text-blue-400 font-['Montserrat']">💫 Usage Tips</h2>
          <ul className="text-gray-300 mt-4 list-disc pl-5 font-['Poppins'] leading-relaxed text-lg">
            <li>Use for 15-30 minutes per session</li>
            <li>Keep the device clean and dry</li>
            <li>Charge fully before each use</li>
            <li>Monitor temperature readings</li>
            <li>Adjust intensity as needed</li>
          </ul>
        </motion.div>
      </div>

      {/* Let's Have a Session Section */}
      <motion.h2 
        className="text-5xl font-bold text-blue-400 mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Let's Have a Session
      </motion.h2>

      <Link href="/session2">
        <motion.button
          className="mb-16 px-12 py-6 bg-blue-500 text-white rounded-full text-2xl font-semibold shadow-lg hover:bg-blue-600 transition duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your Session Now
        </motion.button>
      </Link>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Terms & Conditions Section */}
        <motion.div 
          className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-blue-400/30 border-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">Terms & Conditions</h2>
          <div className="text-gray-300">
            {terms.map((term, index) => (
              <motion.div 
                key={index} 
                className="mb-3 border-b border-blue-400/20 pb-2 last:border-b-0"
              >
                <motion.div 
                  className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-700/50 rounded"
                  onClick={() => toggleTerm(index)}
                >
                  <p className="font-medium text-blue-300">{term.title}</p>
                  <span className="text-blue-400 text-xl">
                    {expandedTerm === index ? '−' : '+'}
                  </span>
                </motion.div>
                {expandedTerm === index && (
                  <motion.div 
                    className="p-2 text-sm text-gray-400"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {term.description}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-blue-400/30 border-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">Frequently Asked Questions</h2>
          <div className="text-gray-300">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index} 
                className="mb-3 border-b border-blue-400/20 pb-2 last:border-b-0"
              >
                <motion.div 
                  className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-700/50 rounded"
                  onClick={() => toggleFaq(index)}
                >
                  <p className="font-medium text-blue-300">{faq.question}</p>
                  <span className="text-blue-400 text-xl">
                    {expandedFaq === index ? '−' : '+'}
                  </span>
                </motion.div>
                {expandedFaq === index && (
                  <motion.div 
                    className="p-2 text-sm text-gray-400"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* About Saheli Modal */}
      <AnimatePresence>
        {showTeam && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gray-900 rounded-3xl border-2 border-blue-400/30 w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <motion.button
                className="absolute top-4 right-4 p-2 bg-blue-500 rounded-full text-white"
                onClick={toggleTeam}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes size={20} />
              </motion.button>
              
              <motion.h2 
                className="text-5xl font-bold text-blue-400 mb-8 text-center mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                About Saheli
              </motion.h2>

              {/* About Saheli Section */}
              <motion.div 
                className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-blue-400/30 border-2 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              >
                <h3 className="text-3xl font-semibold text-blue-400 mb-4">Our Mission</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Saheli was born from a simple yet powerful idea: to create a solution that empowers women to live their lives without being held back by menstrual pain. Our mission is to combine cutting-edge technology with elegant design to provide effective, drug-free relief that fits seamlessly into modern lifestyles.
                </p>
                <h3 className="text-3xl font-semibold text-blue-400 mb-4">The Journey</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Our journey began when a team of passionate innovators came together for the Google Solution Challenge, determined to address the unmet needs of menstrual health. Recognizing this as a critical global challenge for 2025, we developed Saheli as our solution - a smart, responsive device that leverages cutting-edge technology to provide personalized relief from menstrual pain, aligning with UN Sustainable Development Goals for health and gender equality.
                </p>
                <h3 className="text-3xl font-semibold text-blue-400 mb-4">The Technology</h3>
                <p className="text-gray-300 leading-relaxed">
                  Saheli uses a combination of gentle heat therapy and micro-vibration technology that responds to your body's signals. Our proprietary sensors detect muscle tension and temperature changes, automatically adjusting the therapy intensity for optimal comfort and relief. All this is controlled through our intuitive webapp, giving you complete control over your experience.
                </p>
              </motion.div>

              <motion.h2 
                className="text-4xl font-bold text-blue-400 mb-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.4 } }}
              >
                Meet Our Team
              </motion.h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                <motion.div 
                  className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-blue-400/30 border-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src="/team/sriz.jpg" 
                    alt="Sriz Debnath" 
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                  <h3 className="text-2xl font-semibold text-blue-400">Sriz Debnath</h3>
                  <p className="text-blue-300 mb-2">Full Stack Developer</p>
                  <p className="text-gray-400 mb-4">MERN stack & Blockchain developer, passionate about AI and IoT solutions.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="https://instagram.com/_capturedby.ansh_" target="_blank">
                      <FaInstagram className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://www.linkedin.com/in/sriz-debnath-7281351a3" target="_blank">
                      <FaLinkedin className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://github.com/Srizdebnath" target="_blank">
                      <FaGithub className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-blue-400/30 border-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src="/team/arya.jpg" 
                    alt="Arja Acharjee" 
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                  <h3 className="text-2xl font-semibold text-blue-400">Arja Acharjee</h3>
                  <p className="text-blue-300 mb-2">IT student</p>
                  <p className="text-gray-400 mb-4">Passionate about tech and innovation, I strive to develop solutions for real-world problems.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="https://instagram.com/srizdebnath" target="_blank">
                      <FaInstagram className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://linkedin.com/in/srizdebnath" target="_blank">
                      <FaLinkedin className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://github.com/srizdebnath" target="_blank">
                      <FaGithub className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-blue-400/30 border-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src="/team/adhiraj.jpg" 
                    alt="Adhiraj Ghosh" 
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                  <h3 className="text-2xl font-semibold text-blue-400">Adhiraj Ghosh</h3>
                  <p className="text-blue-300 mb-2">Full Stack Developer</p>
                  <p className="text-gray-400 mb-4">Passionate about exploring algorithms, data structures, and software development.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="https://www.instagram.com/_adhiraj_04?igsh=eWFmdW00OWhtMjd0" target="_blank">
                      <FaInstagram className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://www.linkedin.com/in/adhiraj-ghosh-b9986132b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank">
                      <FaLinkedin className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://github.com/Adhirajgh" target="_blank">
                      <FaGithub className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border-blue-400/30 border-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src="/team/saibal.jpg" 
                    alt="Saibal Roy" 
                    className="w-full h-64 object-cover rounded-2xl mb-6"
                  />
                  <h3 className="text-2xl font-semibold text-blue-400">Saibal Roy</h3>
                  <p className="text-blue-300 mb-2">Frontend Web Developer</p>
                  <p className="text-gray-400 mb-4">Passionate about various domains, including frontend development with HTML5, CSS, and JavaScript.</p>
                  <div className="flex gap-4 justify-center">
                    <Link href="https://www.instagram.com/saibal2004" target="_blank">
                      <FaInstagram className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://www.linkedin.com/in/saibal-roy-56610b254" target="_blank">
                      <FaLinkedin className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                    <Link href="https://github.com/Saibal1234" target="_blank">
                      <FaGithub className="text-2xl text-blue-400 hover:text-blue-300" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="text-center text-gray-400 mt-8 mb-4">
        © 2025 Saheli. All rights reserved. Developed by Sriz Debnath.
      </div>
    </div>
  );
}