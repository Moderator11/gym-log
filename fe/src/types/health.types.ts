export interface HealthMetric {
  id: number;
  name: string;
  unit: string;
}

export interface HealthRecordEntry {
  id: number;
  metric_id: number;
  metric_name: string;
  metric_unit: string;
  value: number | null;
}

export interface HealthRecord {
  id: number;
  record_date: string;   // YYYY-MM-DD
  entries: HealthRecordEntry[];
}

export interface HealthStatsSeries {
  metric_id: number;
  metric_name: string;
  metric_unit: string;
  data: { date: string; value: number }[];
}

// 기록 생성/수정 요청 페이로드
export interface HealthRecordEntryPayload {
  metric_id: number;
  value: number | null;
}

export interface HealthRecordPayload {
  record_date: string;
  entries: HealthRecordEntryPayload[];
}
