import { axiosClient } from "./axiosClient";
import { API_CONFIG } from "@/constants/api";
import { SearchPayload} from "@/types/Search";

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

// Rerank lại danh sách keyframe hiện có theo query (cross-encoder trên BE)
export const rerankSearch = async (searchPayload: SearchPayload, keyframeIds: string[]) => {
    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.SEARCH.RERANK, {
        text_query: searchPayload.text_query,
        mode: searchPayload.mode,
        keyframe_ids: keyframeIds,
        top_k: keyframeIds.length,
        user_query: searchPayload.user_query,
        num_query: searchPayload.num_query,
    })
    return response.data
}