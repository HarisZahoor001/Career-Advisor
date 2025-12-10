import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { Link } from "react-router-dom";

export default function Form({ route, method }) {
  const navigate = useNavigate();
  const isLogin = method === "login";

  // Common fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup-only fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [studyField, setStudyField] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let body = { username, password };

    if (!isLogin) {
      body = {
        username,
        password,
        full_name: fullName,
        age,
        education_level: education,
        field_of_study: studyField,
        cgpa,
        skills: skills.split(",").map(s => s.trim()).join(","),
        interests: interests.split(",").map(i => i.trim()).join(","),
        email,
      };
    }

    try {
      const res = await api.post(route, body);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }

    } catch (err) {
      alert("Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black flex justify-center items-center min-h-screen w-full relative px-4 sm:px-6 lg:px-8 py-8">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: "100px 100px",
          opacity: 0.1,
        }}
      />

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left side - Welcome/Info Section */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {isLogin ? "Welcome Back!" : "Start Your Career Journey"}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl">
              {isLogin 
                ? "Sign in to access personalized career recommendations and AI guidance."
                : "Create an account to get personalized career advice based on your skills and interests."}
            </p>
          </div>
          
          {/* Features/Benefits */}
          <div className="hidden lg:block mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">AI-powered career recommendations</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">Personalized skill development plans</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-300">Real-time industry insights</span>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2">
          <form
            onSubmit={handleSubmit}
            className="relative z-10 p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg flex flex-col items-center w-full bg-black/80 backdrop-blur-lg border border-gray-800"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              {isLogin ? "Login" : "Create Account"}
            </h1>

            <div className="w-full space-y-4">
              {/* Username */}
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* SIGNUP FIELDS (Only visible in Signup mode) */}
              {!isLogin && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Age"
                        className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="CGPA"
                        className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Education Level (e.g., Bachelor's, Master's)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Field of Study"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={studyField}
                      onChange={(e) => setStudyField(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Skills (comma-separated, e.g., Python, React, Communication)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Interests (comma-separated, e.g., AI, Web Dev, Data Science)"
                      className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 focus:border-blue-500 transition-all"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex justify-center">
                  <LoadingIndicator />
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full btn text-black font-semibold p-3 sm:p-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2"
                disabled={loading}
              >
                {loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
              </button>

              {/* Link to toggle between Login/Signup */}
              <div className="text-center mt-4">
                {isLogin ? (
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Sign up here
                    </Link>
                  </p>
                ) : (
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Login here
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}