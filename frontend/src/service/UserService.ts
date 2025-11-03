import { AxiosInstance } from "axios";
import { usersApi, profilesApi } from "@/api";
import { User, ProfilePage, PaginatedStancesByUserStance } from "@/models/index";

export class UserService {
	async getCurrentUser(api: AxiosInstance): Promise<User> {
		const response = await usersApi.getCurrentUser(api);
		const user: User = {
            id: response.id,
            username: response.username,
            full_name: response.full_name,
            email: response.email,
        };
		return user;
	}

	async getUser(api: AxiosInstance, userId: number): Promise<User> {
		const response = await usersApi.getUser(api, userId);
		const user: User = {
            id: response.id,
            username: response.username,
            full_name: response.full_name,
            email: response.email,
        };
        return user;
	}

	async deleteUser(api: AxiosInstance, userId: number): Promise<boolean> {
		const response = await usersApi.deleteUser(api, userId);
		return response.success ?? true;
	}

	async getProfilePage(api: AxiosInstance, userId: number): Promise<ProfilePage> {
		const response = await profilesApi.getProfilePage(api, userId);
		const profilePage: ProfilePage = {
			username: response.username,
			bio: response.bio,
			avatar_url: response.avatar_url,
			pinned_stance_id: response.pinned_stance_id,
		};
		return profilePage;
	}

	async getStancesByUser(api: AxiosInstance, userId: number, cursor?: string): Promise<PaginatedStancesByUserStance[]> {
		const response = await usersApi.getStancesByUser(api, userId, 10, cursor);
		return response.stances;
	}
}
