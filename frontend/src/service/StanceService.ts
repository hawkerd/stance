import { Stance, StanceFeedEntity, StanceFeedStance, Comment } from "@/models";
import { stancesApi } from "@/api";
import { AxiosInstance } from "axios";
import { 
  StanceFeedRequest,
  StanceFeedResponse,
  StanceReadResponse,
  StanceCreateResponse,
  StanceUpdateResponse,
  StanceDeleteResponse,
  StanceListResponse,
  StanceCreateRequest,
  StanceUpdateRequest,
  StanceRateRequest,
  StanceRateResponse,
  ReadStanceRatingResponse,
  NumRatingsResponse,
  CommentListResponse,
  StanceFeedStanceResponse
} from "@/api/stances";

export class StanceService {
  async fetchStanceFeed(
    api: AxiosInstance,
    num_stances: number,
    entities: number[],
    initial_stance_id?: number
  ): Promise<StanceFeedStance[]> {
    const request: StanceFeedRequest = {
      num_stances,
      initial_stance_id: initial_stance_id ?? null,
      entities,
    };
    const response: StanceFeedResponse = await stancesApi.getFeed(api, request);
    console.log("Fetched stances:", response.stances);
    const stances = response.stances.map((s) => ({
      ...s,
      entity: s.entity ? s.entity : undefined,
    }));
    return stances;
  }

  async createStance(
    api: AxiosInstance,
    entityId: number,
    headline: string,
    contentJson: string
  ): Promise<Stance> {
    const request: StanceCreateRequest = {
      entity_id: entityId,
      headline,
      content_json: contentJson,
    };
    const response: StanceCreateResponse = await stancesApi.createStance(api, request);
    const stance: Stance = {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: null,
      num_ratings: 0,
    };
    return stance;
  }

  async getStance(api: AxiosInstance, stanceId: number): Promise<Stance> {
    const response: StanceReadResponse = await stancesApi.getStance(api, stanceId);
    const stance: Stance = {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: response.average_rating,
      num_ratings: 0,
    };
    return stance;
  }

  async getStancePage(api: AxiosInstance, stanceId: number): Promise<StanceFeedStance> {
    const response: StanceFeedStanceResponse = await stancesApi.getStancePage(api, stanceId);
    return response.stance;
  }

  async getAllStances(api: AxiosInstance): Promise<Stance[]> {
    const response: StanceListResponse = await stancesApi.getAllStances(api);
    return response.stances.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      entity_id: s.entity_id,
      headline: s.headline,
      content_json: s.content_json,
      comments: [],
      average_rating: s.average_rating,
      num_ratings: 0,
    }));
  }

  async updateStance(
    api: AxiosInstance,
    stanceId: number,
    headline?: string,
    contentJson?: string
  ): Promise<Stance> {
    const request: StanceUpdateRequest = {
      headline,
      content_json: contentJson,
    };
    const response: StanceUpdateResponse = await stancesApi.updateStance(api, stanceId, request);
    const stance: Stance = {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: response.average_rating,
      num_ratings: 0,
    };
    return stance;
  }

  async deleteStance(api: AxiosInstance, stanceId: number): Promise<boolean> {
    const response: StanceDeleteResponse = await stancesApi.deleteStance(api, stanceId);
    return response.success ?? true;
  }

  async getCommentsByStance(api: AxiosInstance, stanceId: number): Promise<Comment[]> {
    const response: CommentListResponse = await stancesApi.getCommentsByStance(api, stanceId);
    const comments: Comment[] = response.comments.map((c) => ({
      id: c.id,
      user_id: c.user_id,
      parent_id: c.parent_id ?? undefined,
      content: c.content,
      likes: c.likes,
      dislikes: c.dislikes,
      count_nested_replies: c.count_nested,
      user_reaction: c.user_reaction as "like" | "dislike" | null,
    }));
    return comments;
  }

  async rateStance(
    api: AxiosInstance,
    stanceId: number,
    rating: number | null
  ): Promise<boolean> {
    const request: StanceRateRequest = { rating };
    const response: StanceRateResponse = await stancesApi.rateStance(api, stanceId, request);
    return response.success ?? true;
  }

  async getMyStanceRating(
    api: AxiosInstance,
    stanceId: number
  ): Promise<number | null> {
    const response: ReadStanceRatingResponse = await stancesApi.getMyStanceRating(api, stanceId);
    return response.rating ?? null;
  }

  async getNumRatings(api: AxiosInstance, stanceId: number): Promise<number> {
    const response: NumRatingsResponse = await stancesApi.getNumRatings(api, stanceId);
    return response.num_ratings ?? 0;
  }
}