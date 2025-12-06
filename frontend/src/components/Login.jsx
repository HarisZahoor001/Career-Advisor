import React from "react";

export default function Login({ className }) {
  return (
    <div className={`${className} bg-black flex justify-center items-center w-full h-screen relative`}>
      
      {/* Grid background for Login */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: "100px 100px",
          opacity: 0.1, // subtle behind Login
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 p-10 rounded-2xl shadow-lg flex flex-col items-center w-[90%] max-w-md bg-black border-2 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white mb-6">Login</h1>

        <div className="flex flex-col gap-5 w-full">
          <input
            type="text"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button className="w-full btn hover:bg-black text-black hover:text-white font-semibold p-3 rounded-lg transition">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
