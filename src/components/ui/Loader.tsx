import React, { useEffect, useState } from "react";
import loader_loop_gif from "@/assets/loader_loop.gif";
import { RefreshCw } from "lucide-react"; // Using Heroicons for the refresh icon

interface LoaderProps {
  height?: number | string;
  width?: number | string;
}

const Loader: React.FC<LoaderProps> = ({ height = 100, width = 100 }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  const handleRefreshClick = () => {
    window.location.reload();
  };

  return (
    <>
      {isLoading ? (
        <img
          src={loader_loop_gif}
          height={height}
          width={width}
          alt="loader"
          className="mx-auto flex justify-center items-center"
        />
      ) : (
        <div className="mt-12 max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <img
            src={loader_loop_gif}
            height={height}
            width={width}
            alt="loader"
            className="mx-auto mb-4 flex justify-center items-center"
          />
          <p className="text-xl font-bold mb-2">Something Went Wrong...</p>
          <p className="text-base mb-4">
            Unfortunately, we're unable to load the content right now.
          </p>
          <div className="px-4">
            <button
              onClick={handleRefreshClick}
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
           <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Loader;
