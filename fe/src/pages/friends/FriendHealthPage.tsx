import { useParams, useNavigate } from "react-router-dom";
import { useFriendHealthRecords } from "@/hooks/useHealth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Activity } from "lucide-react";

export const FriendHealthPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const friendId = id ? parseInt(id, 10) : null;
  const { data: records, isLoading, error } = useFriendHealthRecords(friendId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="secondary" onClick={() => navigate("/friends")}>
          <ArrowLeft size={16} className="mr-1" />
          친구 목록으로
        </Button>
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          건강 기록을 불러올 수 없습니다. 친구가 건강 기록 공유를 비활성화했을 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => navigate("/friends")}>
          <ArrowLeft size={16} className="mr-1" />
          친구 목록으로
        </Button>
        <Activity size={22} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">친구의 건강 기록</h1>
      </div>

      {!records || records.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-500 dark:text-gray-400 py-12">아직 건강 기록이 없습니다</p>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => (
            <Card key={rec.id}>
              <div className="mb-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{rec.record_date}</span>
              </div>

              {rec.entries.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400">기록된 지표 없음</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rec.entries.map((e) => (
                    <div key={e.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{e.metric_name}</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {e.value == null ? (
                          <span className="text-gray-400 dark:text-gray-500 dark:text-gray-400 font-normal">-</span>
                        ) : (
                          `${e.value} ${e.metric_unit}`
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
