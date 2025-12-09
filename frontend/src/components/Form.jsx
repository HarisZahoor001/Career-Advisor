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
    <div className="bg-black flex justify-center items-center w-full h-screen relative">

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

      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-10 rounded-2xl shadow-lg flex flex-col items-center w-[90%] max-w-md bg-black border-2 backdrop-blur-sm"
      >
        <h1 className="text-3xl font-bold text-white mb-6">
          {isLogin ? "Login" : "Signup"}
        </h1>

        <div className="flex flex-col gap-4 w-full">

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* SIGNUP FIELDS (Only visible in Signup mode) */}
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Age"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />

              <input
                type="text"
                placeholder="Education Level"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />

              <input
                type="text"
                placeholder="Field of Study"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={studyField}
                onChange={(e) => setStudyField(e.target.value)}
              />

              <input
                type="number"
                step="0.01"
                placeholder="CGPA"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />

              <input
                type="text"
                placeholder="Skills (comma-separated)"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />

              <input
                type="text"
                placeholder="Interests (comma-separated)"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {loading && <LoadingIndicator />}

          {/* Submit */}
          <button type="submit" className="btn hover:bg-black text-black hover:text-white font-semibold p-3 rounded-lg transition mt-2">
            {isLogin ? "Login" : "Signup"}
          </button>
        {isLogin ? <Link to="/signup" className="text-white  hover:text-blue-400 mt-1 text-end">Create an Account</Link> : <Link to="/login" className="text-white  hover:text-blue-400 mt-1 text-end">Already have an account</Link>}
        </div>
      
      </form>
    </div>
  );
}
