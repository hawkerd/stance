import { AxiosInstance } from "axios";
import { usersApi } from "@/api";
import { User, ProfilePage, Profile } from "@/models/index";

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
			full_name: response.full_name,
			follower_count: response.follower_count,
			following_count: response.following_count,
			following: response.following,
			bio: response.bio,
			avatar_url: response.avatar_url,
			pinned_stance_id: response.pinned_stance_id,
			pinned_stance_entity_id: response.pinned_stance_id_entity_id,
		};
		return profilePage;
	}

	async getProfile(api: AxiosInstance, userId: number): Promise<Profile> {
		const response = await usersApi.getProfile(api, userId);
		const profile: Profile = {
			bio: response.bio,
			avatar_url: response.avatar_url,
			pinned_stance_id: response.pinned_stance_id,
		};
		return profile;
	}

	async followUser(api: AxiosInstance, userId: number): Promise<boolean> {
		return usersApi.followUser(api, userId);
	}

	async unfollowUser(api: AxiosInstance, userId: number): Promise<boolean> {
		return usersApi.unfollowUser(api, userId);
	}

	async getFollowers(api: AxiosInstance, userId: number, cursor?: string, limit?: number): Promise<{users: User[], next_cursor?: string}> {
		const response = await usersApi.getFollowers(api, userId, cursor, limit);
		return { users: response.users, next_cursor: response.next_cursor || undefined };
	}

	async getFollowing(api: AxiosInstance, userId: number, cursor?: string, limit?: number): Promise<{users: User[], next_cursor?: string}> {
		const response = await usersApi.getFollowing(api, userId, cursor, limit);
		return { users: response.users, next_cursor: response.next_cursor || undefined };
	}
}
