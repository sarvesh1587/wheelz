import React from "react";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function VendorPending() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClockIcon className="w-10 h-10 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Application Submitted!
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thank you for registering as a vendor. Our team will review your
          application within 24-48 hours.
        </p>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <EnvelopeIcon className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium">What happens next?</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 ml-8">
            <li>• Admin will review your documents</li>
            <li>• You'll receive approval email</li>
            <li>• Start adding your vehicles</li>
            <li>• Vehicles will be listed after admin approval</li>
          </ul>
        </div>

        <Link to="/" className="btn-primary w-full inline-block text-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
