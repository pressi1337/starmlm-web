import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { useActionCall, useGetCall } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Loader from "@/components/ui/Loader";
import InputText from "@/components/ui/InputText";
import InputTextArea from "@/components/ui/InputTextArea";
import Btn from "@/components/ui/Btn";

const emptyForm = { id: "", question: "", answer: "", sort_order: 0, is_active: 1 };

const SupportHelp = () => {
  const { data, loading, setQuery } = useGetCall(SERVICE.SUPPORT_HELP);
  const { Post, Put, loading: actionLoading, error } = useActionCall(SERVICE.SUPPORT_HELP);
  const { Patch } = useActionCall(SERVICE.SUPPORT_HELP_STATUS_UPDATE);
  const [form, setForm] = useState<any>(emptyForm);

  const requestError = useMemo(() => {
    if (!error || typeof error !== "object") return {};
    return error;
  }, [error]);

  useEffect(() => {
    setQuery({ include_inactive: true });
  }, []);

  if (loading) {
    return <Loader />;
  }

  const items = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support & Help</h1>
        <p className="mt-2 text-gray-600">
          Configure repeated questions with answers so users can get help instantly.
        </p>
      </div>

      <Card className="shadow-soft mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <CardTitle>{form.id ? "Edit Help Item" : "Add Help Item"}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputText
            name="question"
            label="Question *"
            placeholder="Enter repeated customer question"
            onChange={(e: any) => setForm((prev: any) => ({ ...prev, question: e.target.value }))}
            error={requestError}
            value={form}
          />
          <InputTextArea
            name="answer"
            label="Answer *"
            placeholder="Enter the answer shown to users"
            onChange={(e: any) => setForm((prev: any) => ({ ...prev, answer: e.target.value }))}
            error={requestError}
            value={form}
          />
          <InputText
            type="number"
            name="sort_order"
            label="Sort Order"
            placeholder="0"
            onChange={(e: any) => setForm((prev: any) => ({ ...prev, sort_order: e.target.value }))}
            error={requestError}
            value={form}
          />
          <div className="flex items-center gap-3">
            <Btn
              title={form.id ? "Update Help Item" : "Create Help Item"}
              onClick={async () => {
                const payload = { ...form, sort_order: Number(form.sort_order || 0) };
                const response = form.id ? await Put(form.id, payload) : await Post(payload);
                if (response) {
                  setForm(emptyForm);
                  setQuery({ include_inactive: true });
                }
              }}
              isLoading={actionLoading}
            />
            {form.id ? (
              <Btn title="Cancel Edit" uiType="secondary" onClick={() => setForm(emptyForm)} />
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Configured Help Answers</CardTitle>
          <CardDescription>Active and inactive help answers for the user portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length > 0 ? items.map((item: any) => (
            <div key={item.id} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{item.question}</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.answer}</div>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${item.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setForm({
                    id: item.id,
                    question: item.question,
                    answer: item.answer,
                    sort_order: item.sort_order ?? 0,
                    is_active: item.is_active,
                  })}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    const response = await Patch({ id: item.id, is_active: item.is_active ? 0 : 1 });
                    if (response) setQuery({ include_inactive: true });
                  }}
                  className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          )) : (
            <div className="text-sm text-gray-500">No support help items created yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportHelp;
