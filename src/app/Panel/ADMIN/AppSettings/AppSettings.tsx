// @ts-nocheck
import { SlidersHorizontal, Check, X } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";

/**
 * App Settings — the on/off switches for user-facing features.
 *
 * Renders whatever the API returns rather than a hardcoded list, so adding a
 * key to AppSetting::MENU_KEYS on the backend makes its toggle appear here
 * with no frontend change.
 */
export default function AppSettings() {
  const { data, loading, fetchApi } = useGetCall(SERVICE.MENU_SETTINGS);
  const { Post: saveSetting, loading: saving } = useActionCall(
    SERVICE.MENU_SETTINGS
  );

  const items: any[] = data?.data ?? [];

  const toggle = async (item: any) => {
    const resp = await saveSetting(
      { key: item.key, is_visible: item.is_visible ? 0 : 1 },
      `${item.label} ${item.is_visible ? "turned off" : "turned on"}`
    );
    if (resp) fetchApi({});
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-7 h-7 text-violet-600" />
          App Settings
        </h1>
        <p className="mt-2 text-gray-600">
          Switch user-facing features on or off. Changes apply the next time a
          user loads the app.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            No settings available.
          </p>
        ) : (
          items.map((item) => {
            const on = Boolean(item.is_visible);
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {on
                      ? "Visible to users."
                      : "Hidden from users. The feature is also blocked server-side."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={saving}
                  title={on ? "Click to turn off" : "Click to turn on"}
                  className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    on
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {on ? (
                    <>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      On
                    </>
                  ) : (
                    <>
                      <X className="mr-1 h-3.5 w-3.5" />
                      Off
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
