import React, { useState } from "react";
import "../App.css"

export default function Navbar({ className }) {
  const items = ["Home", "Trending fields", , "About", "Review us"];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={`${className} w-full py-4 px-6 sm:px-12 relative`}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="">
          {/* <img src={logo} alt="Logo" className="h-12 w-auto" /> */}
          <h1 className="text text-bold text-[20px]">Career Advisor</h1>
        </div>

        {/* Menu items (Desktop) */}
        <ul className="hidden md:flex space-x-12">
          {items.map((item) => (
            <li
              key={item}
              className="text-white cursor-pointer hover:text-gray-300 text-xl font-medium"
            >
              {item}
            </li>
          ))}
        </ul>

        {/* Get Started button (Desktop) */}
        <div className="hidden md:flex">
          <button className="btn text-black font-Inter text-[18px] font-medium p-3 rounded-full w-[150px] h-[50px] text-center hover:bg-gray-200 transition ">
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-3xl font-bold focus:outline-none"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 w-full  transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col space-y-4 py-4 text-center">
          {items.map((item) => (
            <li
              key={item}
              className="text-white cursor-pointer hover:text-gray-300 text-xl font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </li>
          ))}
          <li>
            <button
              className="bg-white text-black font-Inter text-[18px] font-medium p-3 rounded-full w-[150px] h-[50px] text-center hover:bg-gray-200 transition"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
