import { AxiosInstance } from "axios";
import { entitiesApi } from "@/api";
import {
    EntityReadResponse,
    EntityListResponse,
} from "@/api/entities";
import { Entity, EntityType, EntityFeedEntity } from "@/models";


export class EntityService {
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
