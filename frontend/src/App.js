import Hero from './components/Hero';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="w-full min-h-screen relative bg-black">
      {/* Navbar overlay */}
      <Navbar className="absolute top-0 left-0 w-full z-20" />

      {/* Hero section */}
      <Hero />

      {/* Optional content below Hero */}
      {/* <div className="relative z-10">Other page content</div> */}
    </div>
  );
}
