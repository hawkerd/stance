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
  b64ImageContent: string,
  mimeType: string,
  entityId?: number,
  stanceId?: number,
  profileId?: number
): Promise<ImageCreateResponse> {
  const payload: ImageCreateRequest = {
    mime_type: mimeType,
    b64_image_content: b64ImageContent,
    entity_id: entityId,
    stance_id: stanceId,
    profile_id: profileId,
  };
  const res = await api.post<ImageCreateResponse>("/images", payload);
  return res.data;
}