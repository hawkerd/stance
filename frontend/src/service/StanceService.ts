import { Stance, StanceFeedEntity, StanceFeedStance, Comment, PaginatedStancesByEntityStance, PaginatedStancesByUserStance } from "@/models";
import { stancesApi } from "@/api";
import { AxiosInstance } from "axios";
import { 
  StanceFeedRequest,
  StanceFeedResponse,
  StanceReadResponse,
  StanceCreateResponse,
  StanceUpdateResponse,
  StanceListResponse,
  StanceCreateRequest,
  StanceUpdateRequest,
  StanceRateRequest,
  StanceRateResponse,
  ReadStanceRatingResponse,
  NumRatingsResponse,
  StanceFeedStanceResponse,
  EntityStancesResponse,
  PaginatedStancesByEntityStanceResponse,
  StanceFollowingFeedRequest,
  StanceFollowingFeedResponse
} from "@/api/stances";

export class StanceService {
  async fetchStanceFeed(
    api: AxiosInstance,
    num_stances: number,
    entities?: number[],
    initial_stance_id?: number
  ): Promise<StanceFeedStance[]> {
    const request: StanceFeedRequest = {
      num_stances,
      initial_stance_id: initial_stance_id ?? null,
      entities: entities ?? [],
    };
    const response: StanceFeedResponse = await stancesApi.getFeed(api, request);
    console.log("Fetched stances:", response.stances);
    return response.stances;
  }

  async fetchUserStanceFeed(
    api: AxiosInstance,
    num_stances: number,
    cursor?: string
  ): Promise<{stances: StanceFeedStance[], next_cursor?: string}> {
    const response: StanceFollowingFeedResponse = await stancesApi.getFollowingFeed(api, num_stances, cursor);
    console.log("Fetched stances:", response.stances);
    return {stances: response.stances, next_cursor: response.next_cursor || undefined};
  }

  async createStance(
    api: AxiosInstance,
    entityId: number,
    headline: string,
    contentJson: string
  ): Promise<Stance> {
    const request: StanceCreateRequest = {
      headline,
      content_json: contentJson,
    };
    const response: StanceCreateResponse = await stancesApi.createStance(api, entityId, request);
    return {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: null,
      num_ratings: 0,
    };
  }

  async getStance(
    api: AxiosInstance,
    entityId: number,
    stanceId: number
  ): Promise<Stance> {
    const response: StanceReadResponse = await stancesApi.getStance(api, entityId, stanceId);
    return {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: response.average_rating,
      num_ratings: 0,
    };
  }

  async getStancePage(
    api: AxiosInstance,
    entityId: number,
    stanceId: number
  ): Promise<StanceFeedStance> {
    const response: StanceFeedStanceResponse = await stancesApi.getStancePage(api, entityId, stanceId);
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
    entityId: number,
    stanceId: number,
    headline?: string,
    contentJson?: string
  ): Promise<Stance> {
    const request: StanceUpdateRequest = {
      headline,
      content_json: contentJson,
    };
    const response: StanceUpdateResponse = await stancesApi.updateStance(api, entityId, stanceId, request);
    return {
      id: response.id,
      user_id: response.user_id,
      entity_id: response.entity_id,
      headline: response.headline,
      content_json: response.content_json,
      comments: [],
      average_rating: response.average_rating,
      num_ratings: 0,
    };
  }

  async deleteStance(
    api: AxiosInstance,
    entityId: number,
    stanceId: number
  ): Promise<boolean> {
    return await stancesApi.deleteStance(api, entityId, stanceId);
  }

  async rateStance(
    api: AxiosInstance,
    entityId: number,
    stanceId: number,
    rating: number | null
  ): Promise<boolean> {
    const request: StanceRateRequest = { rating };
    const response: StanceRateResponse = await stancesApi.rateStance(api, entityId, stanceId, request);
    return response.success ?? true;
  }

  async getMyStanceRating(
    api: AxiosInstance,
    entityId: number,
    stanceId: number
  ): Promise<number | null> {
    const response: ReadStanceRatingResponse = await stancesApi.getMyStanceRating(api, entityId, stanceId);
    return response.rating ?? null;
  }

  async getNumRatings(
    api: AxiosInstance,
    entityId: number,
    stanceId: number
  ): Promise<number> {
    const response: NumRatingsResponse = await stancesApi.getNumRatings(api, entityId, stanceId);
    return response.num_ratings ?? 0;
  }

  // get stances by entity with pagination
  async getStancesByEntity(api: AxiosInstance, entityId: number, cursor?: { score: number; id: number }): Promise<{ stances: PaginatedStancesByEntityStance[]; nextCursorScore: number | null; nextCursorId: number | null }> {
      const response: EntityStancesResponse = await stancesApi.getStancesByEntity(
          api,
          entityId,
          cursor ? { score: cursor.score, id: cursor.id } : undefined,
          20
      );
      return {
          stances: response.stances.map((s) => ({
              id: s.id,
              user: s.user,
              headline: s.headline,
              content_json: s.content_json,
              num_comments: s.num_comments,
              average_rating: s.average_rating,
              num_ratings: s.num_ratings,
              my_rating: s.my_rating,
              tags: s.tags,
              created_at: s.created_at,
          })),
          nextCursorScore: response.next_cursor?.score ?? null,
          nextCursorId: response.next_cursor?.id ?? null,
      };
  }

  // get my stance for entity
  async getMyStanceForEntity(
      api: AxiosInstance,
      entityId: number
  ): Promise<PaginatedStancesByEntityStance | null> {
      const response: PaginatedStancesByEntityStanceResponse | null = await stancesApi.getMyStanceForEntity(api, entityId);
      if (response === null) {
          return null;
      }
      return response.stance;
  }

	async getStancesByUser(api: AxiosInstance, userId: number, cursor?: string): Promise<{stances: PaginatedStancesByUserStance[], next_cursor?: string}> {

		const response = await stancesApi.getPaginatedStancesByUser(api, userId, cursor || undefined, 10);
		return {stances: response.stances, next_cursor: response.next_cursor || undefined};
	}

}