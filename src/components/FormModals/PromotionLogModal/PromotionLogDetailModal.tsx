import { useEffect } from "react";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useGetCall, useQueryParams } from "@/hooks";
import { SERVICE } from "@/constants/services";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";

const statusChip = (label: string, status: number) => {
  const map: Record<number, string> = {
    1: "bg-amber-100 text-amber-800", // attempted
    2: "bg-green-100 text-green-800", // confirmed
    3: "bg-gray-200 text-gray-700", // retried
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
        map[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
};

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
    <div className="text-[11px] uppercase tracking-wide text-gray-500">
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

const PromotionLogDetailModal = () => {
  const { searchParams, updateSearchParam } = useQueryParams();
  const View = searchParams.get("View") || undefined;

  const { data, loading, error } = useGetCall(SERVICE.PROMOTION_QUIZ_LOGS, {
    avoidFetch: !Boolean(View),
    key: View,
  });

  const closeModal = () => {
    updateSearchParam({ deleteParams: ["Modal", "View"] });
  };

  useEffect(() => {
    if (error) closeModal();
  }, [error]);

  const d = data?.data;
  const answers: any[] = d?.answers ?? [];

  return (
    <Modal title="Quiz Attempt Details" modalSize="lg" onClose={closeModal}>
      {loading ? (
        <Loader />
      ) : !d ? (
        <div className="py-10 text-center text-gray-500">No details found.</div>
      ) : (
        <div className="max-h-[72vh] overflow-y-auto space-y-5 pr-1">
          {/* Header summary */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-base font-semibold text-gray-900">
                {d.username}
                {d.customer_id ? (
                  <span className="ml-2 text-xs font-mono text-gray-500">
                    {d.customer_id}
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-gray-500">
                {d.mobile ?? ""} • {d.promotion_video_title ?? "Promotion video"}
              </div>
            </div>
            {statusChip(d.status_label, d.status)}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat
              label="Level"
              value={d.promoter_level === null ? "-" : `P${d.promoter_level}`}
            />
            <Stat label="Session" value={`${d.session_label} • Set ${d.set_no}`} />
            <Stat label="Attempt #" value={d.attempt_no} />
            <Stat
              label="Score"
              value={`${d.correct_count}/${d.total_questions} (${d.percentage}%)`}
            />
            <Stat label="Earned (total)" value={`₹${d.earned_amount}`} />
            <Stat
              label="Promotion wallet"
              value={d.main_wallet_amount != null ? `₹${d.main_wallet_amount}` : "-"}
            />
            <Stat
              label="Grow wallet"
              value={d.saving_amount != null ? `₹${d.saving_amount}` : "-"}
            />
            <Stat label="Retry offered" value={d.offered_retry ? "Yes" : "No"} />
            <Stat label="Attempted" value={d.attempted_at} />
            <Stat label="Confirmed" value={d.confirmed_at ?? "-"} />
          </div>

          {/* Per-question answers */}
          <div>
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Answers ({answers.length})
            </div>
            <div className="space-y-3">
              {answers.map((a, i) => {
                const correct = Number(a.is_correct) === 1;
                const skipped = !a.choice_id;
                return (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">
                        {skipped ? (
                          <MinusCircle className="w-4 h-4 text-gray-400" />
                        ) : correct ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {i + 1}. {a.question ?? "—"}
                        </div>
                        <div className="mt-1 text-sm">
                          <span className="text-gray-500">Answered: </span>
                          <span
                            className={
                              skipped
                                ? "text-gray-400 italic"
                                : correct
                                ? "text-green-700 font-medium"
                                : "text-red-700 font-medium"
                            }
                          >
                            {skipped ? "Skipped / no answer" : a.chosen_answer}
                          </span>
                        </div>
                        {!correct && (
                          <div className="mt-0.5 text-sm">
                            <span className="text-gray-500">Correct: </span>
                            <span className="text-green-700 font-medium">
                              {a.correct_answer ?? "—"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {answers.length === 0 && (
                <div className="text-sm text-gray-500">
                  No answer detail recorded for this attempt.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PromotionLogDetailModal;
