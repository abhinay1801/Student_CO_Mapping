import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true); // Track whether the user is in signup or login mode
  const [error, setError] = useState(""); // Store login errors
  const [loading, setLoading] = useState(false); // Track loading state
  const [showPassword, setShowPassword] = useState(false); // Track password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isSignup ? "http://localhost:5000/auth/signup" : "http://localhost:5000/auth/login";

    try
    {
      const response = await axios.post(url, { email, password });
      console.log(isSignup ? "Signup successful:" : "Login successful:", response.data);
      if (response.data.token)
        {
        localStorage.setItem("token", response.data.token);
        navigate("/setentry");
      }

    }
    catch(error)
    {

      //Unauthorized user
      if(error.response?.status === 401)
      {
        setError("Incorrect email or password. Please try again.");
      }
      else if(error.response?.data?.message)
      {
        setError(error.response.data.message);
      } 
      else
      {
        setError("An error occurred. Please try again later.");
      }

      // console.error("Error during login/signup:", error.response?.data || error);
    }
    finally
    {
      setLoading(false);
    }

  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              className="w-full border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {password.length > 0 && (
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                id="showPassword"
                className="text-blue-500 focus:ring-2 focus:ring-blue-500"
                style={{ pointerEvents: 'auto' }}
              />
              <label htmlFor="showPassword" className="text-sm text-gray-700 ml-2">
                Show password
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? "Submitting..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          onClick={() => setIsSignup((prev) => !prev)}
          className="mt-4 text-blue-500 hover:underline block text-center"
        >
          Switch to {isSignup ? "Login" : "Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default LoginSignup;
