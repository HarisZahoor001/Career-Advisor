import React from "react";

export default function Signup({ className }) {
  return (
    <div className={`${className} bg-black flex justify-center items-center w-full h-screen relative`}>
      
      {/* Grid background for Signup */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: "100px 100px",
          opacity: 0.1, // subtle behind form
        }}
      ></div>

      {/* Signup Card */}
      <div className="relative z-10 p-10 rounded-2xl shadow-lg flex flex-col items-center w-[90%] max-w-md bg-black border-2 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white mb-6">Signup</h1>

        <div className="flex flex-col gap-4 w-full">

          {/* Full Name */}
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Age */}
          <input
            type="number"
            placeholder="Age"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Education Level */}
          <input
            type="text"
            placeholder="Education Level"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Field of Study */}
          <input
            type="text"
            placeholder="Field of Study"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* CGPA */}
          <input
            type="number"
            step="0.01"
            placeholder="CGPA"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Skills */}
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Interests */}
          <input
            type="text"
            placeholder="Interests (comma-separated)"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Submit Button */}
          <button className="btn hover:bg-black text-black hover:text-white font-semibold p-3 rounded-lg transition mt-2">
            Signup
          </button>

        </div>
      </div>
    </div>
  );
}
