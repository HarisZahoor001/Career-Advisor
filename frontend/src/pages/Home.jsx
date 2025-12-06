import Hero from "../components/Hero";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <div className="w-full min-h-screen relative bg-black overflow-hidden">
        
        {/* Navbar */}
        <Navbar className="absolute top-0 left-0 w-full z-30" />

        {/* Hero (background content) */}
        <Hero />

        {/* Login (centered on top of Hero) */}
        
      
      </div>
    </>
  );
}
