import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, MessageCircleHeart } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import InputTextArea from "@/components/ui/InputTextArea";
import Btn from "@/components/ui/Btn";

const Suggestions = () => {
  const { data, loading, setQuery } = useGetCall(SERVICE.USER_SUGGESTIONS);
  const { Post, loading: submitting, error } = useActionCall(SERVICE.USER_SUGGESTIONS);
  const [form, setForm] = useState({ suggestion_text: "" });

  const meta = data?.meta || {};
  const suggestions = data?.data || [];

  const requestError = useMemo(() => {
    if (!error || typeof error !== "object") return {};
    return error;
  }, [error]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Suggestions</h1>
        <p className="mt-2 text-gray-600">
          Share your ideas with the team. Up to 3 pending suggestions are allowed at a time until admin reacts.
        </p>
      </div>

      <Card className="shadow-soft mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle>Share an Idea</CardTitle>
          </div>
          <CardDescription>
            Available slots: {meta?.available_slots ?? 0} of 3
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputTextArea
            name="suggestion_text"
            label="Your Suggestion *"
            placeholder="Type your suggestion for the team"
            onChange={(e: any) => setForm({ suggestion_text: e.target.value })}
            error={requestError}
            value={form}
            readOnly={(meta?.available_slots ?? 0) <= 0}
          />
          <Btn
            title="Submit Suggestion"
            onClick={async () => {
              const response = await Post(form);
              if (response) {
                setForm({ suggestion_text: "" });
                setQuery({});
              }
            }}
            isLoading={submitting}
            isDisable={(meta?.available_slots ?? 0) <= 0}
          />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircleHeart className="w-5 h-5 text-primary" />
            <CardTitle>Your Suggestion History</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.length > 0 ? suggestions.map((item: any) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-900">Suggestion #{item.id}</div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.status === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                  {item.status === 1 ? "Admin Reacted" : "Pending Admin Reaction"}
                </span>
              </div>
              <div className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{item.suggestion_text}</div>
              {(item.admin_response_text || item.admin_reaction_emoji) && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <div className="text-sm font-medium text-blue-900">Admin Response</div>
                  {item.admin_reaction_emoji && (
                    <div className="mt-2 text-2xl">{item.admin_reaction_emoji}</div>
                  )}
                  {item.admin_response_text && (
                    <div className="mt-2 whitespace-pre-wrap text-sm text-blue-800">{item.admin_response_text}</div>
                  )}
                </div>
              )}
            </div>
          )) : (
            <div className="text-sm text-gray-500">No suggestions submitted yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Suggestions;
