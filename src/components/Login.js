import React, { useState } from "react";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-80 p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-2xl text-center text-white mb-8">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        {/* Email Input (only for Sign Up) */}
        {isSignup && (
          <div className="flex items-center mb-6 bg-gray-700 rounded-md p-3">
            <div className="text-gray-400 mr-2">
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Email"
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
            className="w-full bg-transparent border-none outline-none text-white"
          />
        </div>

        {/* Submit Button */}
        <button className="w-full py-3 mt-4 bg-blue-500 rounded-lg text-white text-lg hover:bg-blue-600 transition duration-300">
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
