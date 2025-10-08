// src/api/images.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type ImageCreateRequest = components["schemas"]["ImageCreateRequest"];
export type ImageCreateResponse = components["schemas"]["ImageCreateResponse"];

/**
 * Upload an image and create metadata record.
 */
export async function createImage(
  api: AxiosInstance,
  payload: ImageCreateRequest
): Promise<ImageCreateResponse> {
  const res = await api.post<ImageCreateResponse>("/images", payload);
  return res.data;
}