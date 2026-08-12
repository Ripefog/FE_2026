import { axiosClient } from "./axiosClient";
import { API_CONFIG } from "@/constants/api";
import { User } from "@/types/User";

export const login = async ({
    username,
    password
}: User) => {
    const response = await axiosClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        username,
        password
    })
    return response.data
}