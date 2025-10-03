import { Youtube } from "lucide-react";

const YouTubeInputText = ({
  label = "YouTube URL",
  placeholder = "Youtube Video Link",
  onChange = () => {},
  name = "name",
  error = {},
  value = {},
  readOnly = false,
}: any) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={"url"}
          value={value[name]}
          placeholder={placeholder}
          onChange={onChange}
          readOnly={readOnly}
          disabled={readOnly}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-red-800 pt-1" role="alert">
          {error[name]}
        </p>
      </div>
    </div>
  );
};

export default YouTubeInputText;
