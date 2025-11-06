import { AxiosInstance } from "axios";
import { entitiesApi } from "@/api";
import {
    EntityCreateRequest,
    EntityReadResponse,
    EntityUpdateRequest,
    EntityUpdateResponse,
    EntityDeleteResponse,
    EntityListResponse,
} from "@/api/entities";
import { Entity, EntityType, EntityFeedEntity } from "@/models";


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

    // get entities
    async getEntities(
        api: AxiosInstance,
        limit: number,
        num_stances_per_entity: number,
        cursor?: string
    ): Promise<{ entities: EntityFeedEntity[]; nextCursor: string | null; }> {
        const response: EntityListResponse = await entitiesApi.getEntities(
            api,
            limit,
            num_stances_per_entity,
            cursor
        );
        return {
            entities: response.entities,
            nextCursor: response.next_cursor,
        };
    }
}
