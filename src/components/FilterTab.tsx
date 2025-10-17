import { useQueryParams } from "@/hooks";
import { RefreshCw } from "lucide-react";

const SearchInput = ({ value, onChange }) => {
  return (
    <div className="md:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Search
      </label>
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

const FILTER_FIELD = {
  SEARCH: {
    type: "search",
    name: "search",
  },
};
const FilterTab = ({ filter, setFilter, TABLE_FILTER }) => {
  const { defaultFilter } = useQueryParams();
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
      <div className="flex items-start justify-between ">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {TABLE_FILTER.map((fields) => {
              switch (FILTER_FIELD[fields].type) {
                case "search":
                  return (
                    <SearchInput
                      key={fields}
                      value={filter[FILTER_FIELD[fields].name]}
                      onChange={(e: any) =>
                        setFilter((prv) => ({
                          ...prv,
                          search: e.target.value,
                          pageNo: 1,
                        }))
                      }
                    />
                  );
                default:
                  return null;
              }
            })}
            {/* <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search videos..."
              // value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div> */}
            {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              // value={sortBy}
              // onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="showingDate">Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <select
              // value={sortBy}
              // onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="showingDate">Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <select
              // value={sortBy}
              // onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="showingDate">Date</option>
              <option value="title">Title</option>
              <option value="type">Type</option>
            </select>
          </div> */}
          </div>
        </div>
        <div className="p-6">
          <div
            onClick={() => setFilter((prv) => ({ ...defaultFilter }))}
            className="cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterTab;
