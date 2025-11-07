import { AxiosInstance } from "axios";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  TokenResponse,
  RefreshRequest,
  RefreshResponse,
  LogoutRequest,
  ChangePasswordRequest
} from "@/api/auth";
import { authApi } from "@/api";
import { User } from "@/models/index";

export class AuthService {
  async signup(api: AxiosInstance, username: string, password: string, email: string, full_name: string): Promise<User> {
    const request: SignupRequest = { username, full_name, password, email };
    const response: SignupResponse = await authApi.signup(api, request);
    const user: User = {
        id: response.id,
        username: response.username,
        full_name: response.full_name,
        email: response.email,
    };
    return user;
  }

  async login(api: AxiosInstance, username: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const request: LoginRequest = { username, password };
    const response: TokenResponse = await authApi.login(api, request);
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }

  async refreshToken(api: AxiosInstance, refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    const request: RefreshRequest = { refresh_token: refreshToken };
    const response: RefreshResponse = await authApi.refreshToken(api, request);
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
    };
  }

  async logout(api: AxiosInstance, refreshToken: string): Promise<boolean> {
    const request: LogoutRequest = { refresh_token: refreshToken };
    const response: boolean = await authApi.logout(api, request);
    return response;
  }

  async changePassword(api: AxiosInstance, oldPassword: string, newPassword: string): Promise<boolean> {
    const request: ChangePasswordRequest = {
      current_password: oldPassword,
      new_password: newPassword,
    };
    const response: boolean = await authApi.changePassword(api, request);
    return response;
  }
}
