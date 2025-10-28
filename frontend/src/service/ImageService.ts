import { AxiosInstance } from "axios";
import { imagesApi } from "@/api";

export class ImageService {
	async createImage(
		api: AxiosInstance,
		entityId: number,
		mimeType: string,
		imageContent: string,
		stanceId?: number | null
	): Promise<{ publicUrl: string }> {
		const payload = {
			entity_id: entityId,
			mime_type: mimeType,
			image_content: imageContent,
			stance_id: stanceId ?? null,
		};
		const res = await imagesApi.createImage(api, payload);
		return {
			publicUrl: res.public_url,
		};
	}
}
