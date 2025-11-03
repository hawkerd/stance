import { AxiosInstance } from "axios";
import { usersApi } from "@/api";
import { User, ProfilePage, PaginatedStancesByUserStance } from "@/models/index";
import { PaginatedStancesByUserRequest } from "@/api/users";

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
		return response;
	}

	async getProfilePage(api: AxiosInstance, userId: number): Promise<ProfilePage> {
		const response = await usersApi.getProfilePage(api, userId);
		const profilePage: ProfilePage = {
			username: response.username,
			bio: response.bio,
			avatar_url: response.avatar_url,
			pinned_stance_id: response.pinned_stance_id,
			pinned_stance_entity_id: response.pinned_stance_id_entity_id,
		};
		return profilePage;
	}
}
