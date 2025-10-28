import { AxiosInstance } from "axios";
import { usersApi } from "@/api";
import { User } from "@/models/index";

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
}
