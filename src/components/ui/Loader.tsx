import React, { useEffect, useState } from "react";
import loader_loop_gif from "@/assets/loader_loop.gif";
import { RefreshCw } from "lucide-react"; // Using Heroicons for the refresh icon

interface LoaderProps {
  height?: number | string;
  width?: number | string;
}

const Loader: React.FC<LoaderProps> = ({ height = 100, width = 100 }) => {
  return (
    <>
      <img
        src={loader_loop_gif}
        height={height}
        width={width}
        alt="loader"
        className="mx-auto flex justify-center items-center"
      />
    </>
  );
};

export default Loader;
