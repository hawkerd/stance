import { AxiosInstance } from "axios";
import { imagesApi } from "@/api";

export class ImageService {
	async createImage(
		api: AxiosInstance,
		mimeType: string,
		b64ImageContent: string,
		entityId?: number,
		stanceId?: number,
		profileId?: number,
	): Promise<{ publicUrl: string }> {
		const res = await imagesApi.createImage(api, b64ImageContent, mimeType, entityId, stanceId, profileId);
		return {
			publicUrl: res.public_url,
		};
	}
}
