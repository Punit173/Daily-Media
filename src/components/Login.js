import React, { useState } from "react";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase/firebase.js';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  // Google Authentication
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Logged in with Google");
      navigate('/post'); // Redirect to Post.js after successful login
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert(error.message);
    }
  };

  // Normal Sign In / Sign Up
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Sign up successful");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful");
      }
      navigate('/post'); // Redirect to Post.js after successful login/signup
    } catch (error) {
      console.error("Firebase Auth error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-96 p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl text-center text-white mb-8">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        {/* Email Input */}
        {isSignup && (
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
        )}

        {/* Username Input */}
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

        {/* Password Input */}
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
        
        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 mb-4 bg-white text-gray-700 flex items-center justify-center rounded-lg shadow hover:bg-gray-100 transition duration-300"
        >
          <FcGoogle className="mr-2" /> Sign {isSignup ? "Up" : "In"} with Google
        </button>

        {/* Submit Button */}
        <button
          onClick={handleAuth}
          className="w-full py-3 mt-4 bg-blue-500 rounded-lg text-white text-lg hover:bg-blue-600 transition duration-300"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>

        {/* Toggle Between Login/Signup */}
        <p className="text-center text-white mt-4">
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span
            className="text-blue-400 font-bold cursor-pointer hover:underline"
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
