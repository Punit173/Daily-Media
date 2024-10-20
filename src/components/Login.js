/* punit bhai name ka anhi bhi kuch use nhi hura kyuki woh kahi store nh i hora */



import React, { useState } from "react";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  dbf, // Ensure this imports your Firestore instance
} from '../firebase/firebase.js';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc } from "firebase/firestore"; // Import Firestore functions

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Logged in with Google");
      navigate('/home'); 
    
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data in Firestore
        await setDoc(doc(dbf, "users", user.uid), {
          username: username,
          email: user.email,
          createdAt: new Date(),
        });

        alert("Sign up successful and user data saved to Firestore");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful");
      }

      localStorage.setItem("email",email);
      navigate('/home');
    } catch (error) {
      console.error("Firebase Auth error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="relative h-screen flex justify-center items-center">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        autoPlay
        muted
        loop
      >
        <source src="\loginbg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="w-96 p-8 bg-gray-800 rounded-lg shadow-xl z-20 bg-opacity-80">
        <h2 className="text-2xl text-center text-white mb-8">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        
          <div className="flex items-center mb-6 bg-gray-700 rounded-md p-3">
            <div className="text-gray-400 mr-2">
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white"
            />
          </div>
        
{isSignup && 
        <div className="flex items-center mb-6 bg-gray-700 rounded-md p-3">
          <div className="text-gray-400 mr-2">
            <FaUserAlt />
          </div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white"
          />
        </div>
}

        <div className="flex items-center mb-6 bg-gray-700 rounded-md p-3">
          <div className="text-gray-400 mr-2">
            <FaLock />
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-white"
          />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 mb-4 bg-white text-gray-700 flex items-center justify-center rounded-lg shadow hover:bg-gray-100 transition duration-300"
        >
          <FcGoogle className="mr-2" /> Sign {isSignup ? "Up" : "In"} with Google
        </button>

        <button
          onClick={handleAuth}
          className="w-full py-3 mt-4 bg-green-800 rounded-lg text-white text-lg hover:bg-blue-600 transition duration-300"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="text-center text-white mt-4">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span
            className="text-green-600 font-bold cursor-pointer hover:underline"
            onClick={toggleAuthMode}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
