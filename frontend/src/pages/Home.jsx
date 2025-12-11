import Careers from "../components/Careers";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import shadow1 from '../assets/s1.png';

export default function Home() {
  return (
    <div className="w-full min-h-screen relative bg-black overflow-hidden">
      {/* Grid Background - FIXED: Add fixed positioning and height */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
            repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
          `,
          backgroundSize: '100px 100px',
          opacity: 0.1,
        }}
      />

      {/* Shadow / overlay image */}
      <div className="fixed mr-auto inset-0 z-10">
        <img
          src={shadow1}
          alt="Shadow Overlay"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      {/* Content container */}
      <div className="relative z-20">
        {/* Navbar - Positioned at top */}
        <Navbar />
        
        {/* Hero Section - Main content */}
        <Hero />
        
        {/* Careers Section */}
        <Careers />
      </div>
    </div>
  );
}