import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import InputTextArea from "@/components/ui/InputTextArea";
import Btn from "@/components/ui/Btn";

const emojiOptions = ["👍", "❤️", "🔥", "👏", "😊", "✅"];

const SuggestionManagement = () => {
  const { data, loading, setQuery } = useGetCall(SERVICE.USER_SUGGESTIONS);
  const { Post, loading: actionLoading, error } = useActionCall(SERVICE.USER_SUGGESTIONS_REACT);
  const [drafts, setDrafts] = useState<Record<string, any>>({});

  const requestError = useMemo(() => {
    if (!error || typeof error !== "object") return {};
    return error;
  }, [error]);

  if (loading) {
    return <Loader />;
  }

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suggestion Management</h1>
        <p className="mt-2 text-gray-600">
          Review user ideas and react with text or emoji. Once reacted, that user gets one more suggestion slot unlocked.
        </p>
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle>User Suggestions</CardTitle>
          </div>
          <CardDescription>Newest suggestions appear first.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 ? items.map((item: any) => {
            const draft = drafts[item.id] || {
              admin_response_text: item.admin_response_text || "",
              admin_reaction_emoji: item.admin_reaction_emoji || "",
            };

            return (
              <div key={item.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {item?.user?.username || "User"} ({item?.user?.mobile || "-"})
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.suggestion_text}</div>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.status === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {item.status === 1 ? "Reacted" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <InputTextArea
                    name={`admin_response_text_${item.id}`}
                    label="Admin Response"
                    placeholder="Type your response"
                    onChange={(e: any) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: { ...draft, admin_response_text: e.target.value },
                      }))
                    }
                    error={requestError}
                    value={{ [`admin_response_text_${item.id}`]: draft.admin_response_text }}
                  />
                  <div>
                    <div className="mb-2 text-sm font-medium text-gray-900">Emoji Reaction</div>
                    <div className="flex flex-wrap gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() =>
                            setDrafts((prev) => ({
                              ...prev,
                              [item.id]: { ...draft, admin_reaction_emoji: emoji },
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-xl ${draft.admin_reaction_emoji === emoji ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      Selected: {draft.admin_reaction_emoji || "None"}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Btn
                    title={item.status === 1 ? "Update Reaction" : "Save Reaction"}
                    onClick={async () => {
                      const response = await Post({
                        id: item.id,
                        admin_response_text: draft.admin_response_text,
                        admin_reaction_emoji: draft.admin_reaction_emoji,
                      });
                      if (response) setQuery({});
                    }}
                    isLoading={actionLoading}
                  />
                </div>
              </div>
            );
          }) : (
            <div className="text-sm text-gray-500">No suggestions found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuggestionManagement;
