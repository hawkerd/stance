import { AxiosInstance } from "axios";
import { entitiesApi } from "@/api";
import {
  createEntity,
  getEntity,
  updateEntity,
  deleteEntity,
  listEntities,
  getMyStanceForEntity,
  getFeed,
  EntityCreateRequest,
  EntityReadResponse,
  EntityUpdateRequest,
  EntityUpdateResponse,
  EntityDeleteResponse,
  EntityListResponse,
  EntityFeedRequest,
  EntityFeedResponse,
  StanceReadResponse,
  StanceFeedStanceResponse
} from "@/api/entities";
import { Entity, Stance, EntityType, EntityFeedEntity, StanceFeedStance } from "@/models";


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
    ): Promise<StanceFeedStance | null> {
        const response: StanceFeedStanceResponse | null = await entitiesApi.getMyStanceForEntity(api, entityId);
        if (response === null) {
            return null;
        }
        const stance: StanceFeedStance = {
            ...response.stance
        };
        return stance;
    }

    // get feed
    async getFeed(
        api: AxiosInstance,
        num_entities: number,
        num_stances_per_entity: number,
    ): Promise<EntityFeedEntity[]> {
        const request: EntityFeedRequest = {
            num_entities,
            num_stances_per_entity,
        };
        const response: EntityFeedResponse = await entitiesApi.getFeed(api, request);
        const entities: EntityFeedEntity[] = response.entities.map((e) => ({
            ...e,
        }));
        return entities;
    }
}
