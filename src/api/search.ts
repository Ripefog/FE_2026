import { axiosClient } from "./axiosClient";
import { API_CONFIG } from "@/constants/api";
import { SearchPayload} from "@/types/Search";
import { TrakeSearchPayload, TrakeSearchResponse } from "@/types/Trake";

export const simpleSearch = async (searchPayload: SearchPayload) => {
    // const username = localStorage.getItem("username") || "Unknown User";

    const payload = {
        text_query: searchPayload.text_query,
        mode: searchPayload.mode,
        object_filters: searchPayload.object_filters || {},
        color_filters: searchPayload.color_filters || [],
        ocr_query: searchPayload.ocr_query,
        asr_query: searchPayload.asr_query,
        top_k: searchPayload.top_k,
        user_query: searchPayload.user_query,
        num_query: searchPayload.num_query
    };

    console.log("payload", JSON.stringify(payload, null, 2));


    if (process.env.NEXT_PUBLIC_MODE === "test") {
        const response = await axiosClient.get("https://685aaeb59f6ef9611157681f.mockapi.io/dientoangroup/gianguyen")
        return response.data
    }

    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.SEARCH.SIMPLE, payload)
    return response.data

    
}

export const temporalSearch = async (searchPayload: SearchPayload) => {
    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.SEARCH.TEMPORAL, {
        searchPayload
    })
    return response.data
}

// TRAKE: tìm chuỗi khung hình tuần tự (nhiều sự kiện) trong cùng 1 video — POST /search/trake
// BE chạy Viterbi forward-backward trên top-k từng query rồi ghép sequence thỏa min/max_time_gap
export const trakeSearch = async (payload: TrakeSearchPayload): Promise<TrakeSearchResponse> => {
    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.SEARCH.TRAKE, payload)
    return response.data
}

// Rerank lại danh sách keyframe hiện có theo query (GroundingDINO trên BE)
// Schema BE (RerankingSearchRequest): { query, frames: [{keyframe_id, retrieval_score?}], top_k? }
export const rerankSearch = async (
    searchPayload: SearchPayload,
    frames: { keyframe_id: string; score?: number | null }[]
) => {
    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.SEARCH.RERANK, {
        query: searchPayload.text_query,
        frames: frames.map((f) => ({
            keyframe_id: f.keyframe_id,
            retrieval_score: f.score ?? null,
        })),
        top_k: frames.length,
    })
    return response.data
}