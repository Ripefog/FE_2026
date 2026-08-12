export type ObjectFilterConstraint = [number[], number[]][];

// Chỉ cho phép 1 trong 3: count | min_count | max_count
export type ObjectFilterEntry =
  | {
      count: number;
      min_count?: never;
      max_count?: never;
      constraint: ObjectFilterConstraint;
      show_constraint: boolean;
    }
  | {
      count?: never;
      min_count: number;
      max_count?: never;
      constraint: ObjectFilterConstraint;
      show_constraint: boolean;
    }
  | {
      count?: never;
      min_count?: never;
      max_count: number;
      constraint: ObjectFilterConstraint;
      show_constraint: boolean;
    };


export type ObjectFilters = Record<string, ObjectFilterEntry>;

export type CountMeta = Record<
  string,
  {
    type: "count" | "min_count" | "max_count";
    value: number;
    show_constraint?: boolean;
  }
>;


export type SearchPayload = {
    text_query: string,
    mode: string,
    object_filters: ObjectFilters;
    color_filters: [number, number, number][],
    ocr_query: string,
    asr_query: string,
    top_k: number,
    user_query: string,
    num_query: number
}