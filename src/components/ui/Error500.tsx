import React, { useEffect, useState } from "react";
import loader_loop_gif from "@/assets/loader_loop.gif";
import { RefreshCw } from "lucide-react"; // Using Heroicons for the refresh icon

export default function Error500({
  title = "Something Went Wrong...",
  description = "Unfortunately, we're unable to load the content right now.",
}) {
  return (
    <div className="mt-12 max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
      <img
        src={loader_loop_gif}
        height={100}
        width={100}
        alt="loader"
        className="mx-auto mb-4 flex justify-center items-center"
      />
      <p className="text-xl font-bold mb-2">{title}</p>
      <p className="text-base mb-4">{description}</p>
    </div>
  );
}
