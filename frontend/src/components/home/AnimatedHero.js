import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const STATS = [
  { label: "Vehicles", value: "500+", icon: "🚗" },
  { label: "Cities", value: "15+", icon: "🏙️" },
  { label: "Happy Renters", value: "50K+", icon: "😊" },
  { label: "Rating", value: "4.8★", icon: "⭐" },
];

export default function AnimatedHero() {
  const navigate = useNavigate();
  const [nlQuery, setNlQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const heroImages = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600",
    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1600",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1600",
    "https://images.unsplash.com/photo-1593941707882-5a14953f2b6a?w=1600",
  ];

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Mouse move effect for parallax
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x: x * 20, y: y * 20 });
  };

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/ai/smart-search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: nlQuery }),
        },
      );
      const data = await response.json();
      const params = data.extractedParams;
      const qs = new URLSearchParams();
      if (params?.category) qs.set("category", params.category);
      if (params?.maxPrice) qs.set("maxPrice", params.maxPrice);
      if (params?.city) qs.set("city", params.city);
      if (params?.fuelType) qs.set("fuelType", params.fuelType);
      if (nlQuery) qs.set("search", nlQuery);
      navigate(`/vehicles?${qs.toString()}`);
    } catch {
      navigate(`/vehicles?search=${encodeURIComponent(nlQuery)}`);
    } finally {
      setSearching(false);
    }
  };

  const quickTags = [
    { label: "🚗 Cars", query: "car", type: "category" },
    { label: "🏍️ Bikes", query: "bike", type: "category" },
    { label: "⚡ Electric", query: "electric", type: "fuelType" },
    { label: "🏙️ Mumbai", query: "Mumbai", type: "city" },
    { label: "🌆 Bangalore", query: "Bangalore", type: "city" },
    { label: "🏛️ Delhi", query: "Delhi", type: "city" },
  ];

  const handleTagClick = (tag) => {
    if (tag.type === "category") navigate(`/vehicles?category=${tag.query}`);
    else if (tag.type === "fuelType")
      navigate(`/vehicles?fuelType=${tag.query}`);
    else navigate(`/vehicles?city=${tag.query}`);
  };

  return (
    <div
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt="Hero background"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(1.1) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
                transition: "transform 0.3s ease-out",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/70 to-gray-900/90" />
          </div>
        ))}
      </div>

      {/* Animated Gradient Orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-amber-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 6}px`,
              height: `${2 + Math.random() * 6}px`,
              animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 min-h-screen flex items-center py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* AI Badge */}
          <div className="animate-bounce-slow">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 text-amber-400 px-5 py-2 rounded-full text-sm font-medium mb-6 hover:bg-amber-500/20 transition-all duration-300">
              <SparklesIcon className="w-4 h-4 animate-pulse" />
              AI-Powered Vehicle Rental Platform
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white block">Rent the Perfect</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Ride
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cars, bikes, and more — across 15+ Indian cities. Book in minutes,
            drive in style.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSmartSearch}
            className="relative max-w-2xl mx-auto mb-8"
          >
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 group-hover:border-white/30 transition-all duration-300">
                <SparklesIcon className="w-5 h-5 text-amber-400 ml-5 flex-shrink-0" />
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder='Try: "I need a bike under ₹500 in Bangalore"'
                  className="flex-1 px-4 py-5 text-white bg-transparent outline-none text-base placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="m-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 disabled:opacity-70 transform hover:scale-105"
                >
                  {searching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Quick Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleTagClick(tag)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm rounded-xl border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105"
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map((stat, idx) => (
              <div
                key={stat.label}
                className="text-center group cursor-pointer"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 group-hover:text-amber-400 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-amber-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
}
