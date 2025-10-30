import { AxiosInstance } from "axios";
import { entitiesApi } from "@/api";
import {
    EntityCreateRequest,
    EntityReadResponse,
    EntityUpdateRequest,
    EntityUpdateResponse,
    EntityDeleteResponse,
    EntityListResponse,
    EntityFeedResponse,
    StanceReadResponse,
    PaginatedStancesByEntityStanceResponse,
    StanceFeedResponse,
    PaginatedStanceByEntityRequest,
    PaginatedStancesByEntityResponse
} from "@/api/entities";
import { Entity, Stance, EntityType, EntityFeedEntity, PaginatedStancesByEntityStance } from "@/models";


export class EntityService {

    // create
    async createEntity(
        api: AxiosInstance,
        type: EntityType,
        title: string,
        images: string[],
        tags: {
            id: number;
            name: string;
            tag_type: number;
        }[],
        description?: string,
        start_time?: string,
        end_time?: string,
    ): Promise<Entity> {
        const payload: EntityCreateRequest = {
            type,
            title,
            images,
            tags,
            description,
            start_time,
            end_time,
        };
        const response: EntityReadResponse = await entitiesApi.createEntity(api, payload);
        const entity: Entity = {
            ...response
        };
        return entity;
    }

    // read
    async getEntity(
        api: AxiosInstance,
        entityId: number
    ): Promise<Entity> {
        const response: EntityReadResponse = await entitiesApi.getEntity(api, entityId);
        const entity: Entity = {
            ...response
        };
        return entity;
    }

    // update
    async updateEntity(
        api: AxiosInstance,
        entityId: number,
        title?: string,
        images?: string[],
        tags?: {
            id: number;
            name: string;
            tag_type: number;
        }[],
        description?: string,
        start_time?: string,
        end_time?: string,
    ): Promise<Entity> {
        const payload: EntityUpdateRequest = {
            title,
            images,
            tags,
            description,
            start_time,
            end_time,
        };
        const response: EntityUpdateResponse = await entitiesApi.updateEntity(api, entityId, payload);
        const entity: Entity = {
            ...response,
            tags: []
        };
        return entity;
    }

    // delete
    async deleteEntity(
        api: AxiosInstance,
        entityId: number
    ): Promise<boolean> {
        const response: EntityDeleteResponse = await entitiesApi.deleteEntity(api, entityId);
        return response.success;
    }

    // list all entites
    async listEntities(
        api: AxiosInstance
    ): Promise<Entity[]> {
        const response: EntityListResponse = await entitiesApi.listEntities(api);
        const entities: Entity[] = response.entities.map((e) => ({
            ...e
        }));
        return entities;
    }

    // get my stance for entity
    async getMyStanceForEntity(
        api: AxiosInstance,
        entityId: number
    ): Promise<PaginatedStancesByEntityStance | null> {
        const response: PaginatedStancesByEntityStanceResponse | null = await entitiesApi.getMyStanceForEntity(api, entityId);
        if (response === null) {
            return null;
        }
        return response.stance;
    }

    // get feed
    async getFeed(
        api: AxiosInstance,
        num_entities: number,
        num_stances_per_entity: number,
        cursor?: string
    ): Promise<{ entities: EntityFeedEntity[]; nextCursor: string | null; hasMore: boolean }> {
        const response: EntityFeedResponse = await entitiesApi.getFeed(
            api,
            num_entities,
            num_stances_per_entity,
            cursor
        );
        return {
            entities: response.entities,
            nextCursor: response.next_cursor,
            hasMore: response.has_more
        };
    }

    // get stances by entity with pagination
    async getStancesByEntity(api: AxiosInstance, entityId: number, cursor?: { score: number; id: number }): Promise<{ stances: PaginatedStancesByEntityStance[]; nextCursorScore: number | null; nextCursorId: number | null }> {
        const request: PaginatedStanceByEntityRequest = {
            num_stances: 20,
            cursor: cursor ? { score: cursor.score, id: cursor.id } : null
        }
        
        const response: StanceFeedResponse = await entitiesApi.getStancesByEntity(
            api,
            entityId,
            request
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
}
