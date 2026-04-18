import React, { useState } from "react";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Add your contact form API endpoint here
    setTimeout(() => {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 pt-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Contact Us
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          We'd love to hear from you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <PhoneIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Phone
          </h3>
          <p className="text-gray-600 dark:text-gray-400">+91 98765 43210</p>
          <p className="text-gray-500 text-sm">Mon-Sat, 9AM-9PM</p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <EnvelopeIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Email
          </h3>
          <p className="text-gray-600 dark:text-gray-400">support@wheelz.com</p>
          <p className="text-gray-500 text-sm">24/7 Response</p>
        </div>
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
          <MapPinIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Office
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Bangalore, India</p>
          <p className="text-gray-500 text-sm">Visit by appointment</p>
        </div>
      </div>
    </div>
  );
}
