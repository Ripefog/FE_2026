// Types cho TRAKE temporal search — khớp schema TemporalSearchRequest/Response của BE (POST /search/trake)

export type TrakeQuery = {
  step: number;
  text_query: string;
};

export type TemporalStep = {
  step: number;
  keyframe_id: string;
  video_id: string;
  timestamp: number;
  score: number;
  text_query: string;
};

export type TemporalSequence = {
  sequence_id: number;
  video_id: string;
  steps: TemporalStep[];
  sequence_score: number;
  temporal_consistency: number;
  time_gaps: number[];
  total_duration: number;
};

export type TrakeSearchPayload = {
  sequential_queries: TrakeQuery[];
  mode: string;
  top_k_per_query: number;
  min_time_gap: number;
  max_time_gap: number;
  top_sequences: number;
};

export type TrakeSearchResponse = {
  sequential_queries: TrakeQuery[];
  // kết quả riêng của từng query (index theo thứ tự sequential_queries)
  query_results: any[][];
  temporal_sequences: TemporalSequence[];
  total_sequences: number;
  processing_time: number;
};
