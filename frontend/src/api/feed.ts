// Helper for /home/feed endpoint

import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type HomeFeedRequest = components["schemas"]["HomeFeedRequest"];
export type HomeFeedResponse = components["schemas"]["HomeFeedResponse"];

/**
 * Fetch the home feed data
 */
export async function getHomeFeed(
  api: AxiosInstance,
  params?: HomeFeedRequest
): Promise<HomeFeedResponse> {
  const res = await api.post<HomeFeedResponse>("/home/feed", { params });
  return res.data;
}
