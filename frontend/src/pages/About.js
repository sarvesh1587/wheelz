import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  UsersIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function About() {
  const stats = [
    { number: "500+", label: "Vehicles", icon: ShieldCheckIcon },
    { number: "15+", label: "Cities", icon: GlobeAltIcon },
    { number: "50K+", label: "Happy Customers", icon: UsersIcon },
    { number: "4.8", label: "Customer Rating", icon: StarIcon },
  ];

  const values = [
    {
      title: "Trust & Transparency",
      description:
        "No hidden charges, clear pricing, and full transparency in every transaction.",
      icon: ShieldCheckIcon,
      color: "bg-blue-500",
    },
    {
      title: "Customer First",
      description: "24/7 customer support and hassle-free booking experience.",
      icon: HeartIcon,
      color: "bg-red-500",
    },
    {
      title: "Quality Assurance",
      description: "All vehicles are thoroughly inspected and maintained.",
      icon: CheckBadgeIcon,
      color: "bg-green-500",
    },
    {
      title: "Innovation",
      description:
        "AI-powered search and smart recommendations for best experience.",
      icon: SparklesIcon,
      color: "bg-purple-500",
    },
  ];

  const milestones = [
    {
      year: "2024",
      title: "Company Founded",
      description:
        "Wheelz started with a vision to revolutionize vehicle rentals in India",
    },
    {
      year: "2024",
      title: "First 1000 Bookings",
      description: "Achieved 1000 successful bookings within first 3 months",
    },
    {
      year: "2025",
      title: "Expanded to 15 Cities",
      description: "Launched operations in 15 major Indian cities",
    },
    {
      year: "2025",
      title: "AI Integration",
      description: "Introduced AI-powered chatbot and smart search",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pt-24">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            About <span className="text-gray-900">Wheelz</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-95">
            Revolutionizing mobility in India with premium car and bike rentals
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"></div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Founded in 2024,{" "}
                <span className="text-amber-500 font-semibold">Wheelz</span> was
                born from a simple idea: making quality vehicle rentals
                accessible, affordable, and hassle-free for everyone in India.
              </p>
              <p>
                What started as a small operation in Bangalore has now grown
                into a trusted platform serving thousands of customers across
                15+ major cities. We've helped over 50,000 happy renters find
                their perfect ride, from economy cars to luxury SUVs and premium
                bikes.
              </p>
              <p>
                Our AI-powered platform ensures you get the best vehicle at the
                best price, with transparent pricing and 24/7 customer support.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link to="/vehicles" className="btn-primary">
                Browse Vehicles
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold">50K+</div>
                  <div className="text-sm opacity-90">Happy Customers</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Premium Vehicles</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold">15+</div>
                  <div className="text-sm opacity-90">Cities Covered</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold">4.8★</div>
                  <div className="text-sm opacity-90">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className={`${value.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <value.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Key milestones in our growth story
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-amber-500 mb-2">
                    {milestone.year}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {milestone.title}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {milestone.description}
                  </p>
                </div>
                {index < milestones.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <GlobeAltIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Our Mission
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To provide seamless, technology-driven mobility solutions that
              empower people to travel freely across India with confidence,
              convenience, and complete peace of mind.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Our Vision
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To become India's most trusted and innovative vehicle rental
              platform, setting new standards for quality, reliability, and
              customer satisfaction in the mobility space.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Wheelz?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy customers who trust us for their mobility
            needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vehicles"
              className="bg-white text-amber-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse Vehicles
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
