import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const client = axios.create({ baseURL, timeout: 45000 });

export async function planTrip(payload) {
  const { data } = await client.post("/plan/", payload);
  return data;
}

export function extractError(error) {
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.data) {
    const first = Object.values(error.response.data)[0];
    if (Array.isArray(first)) return first[0];
    if (typeof first === "string") return first;
  }
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  return "Could not reach the planning service. Is the backend running?";
}
