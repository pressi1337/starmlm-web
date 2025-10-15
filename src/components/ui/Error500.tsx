import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react"; // Using Heroicons for the refresh icon

export default function Error500({
  title = "Something Went Wrong...",
  description = "Unfortunately, we're unable to load the content right now.",
}) {
  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-xl text-center shadow-sm">
          <div className="flex justify-center mb-3">
            <AlertTriangle className="w-8 h-8 text-red-700" />
          </div>
          <h3 className="text-2xl font-semibold text-red-700 mb-2">
            {title || 'Something went wrong!'}
          </h3>
          <p className="text-red-600">
            {description || 'An unexpected error occurred. Please try refreshing the page or come back later.'}
          </p>
        </div>
      </div>
  );
}
