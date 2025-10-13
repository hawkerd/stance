// entity feed models
export interface EntityFeedStance {
    id: number;
    headline: string;
    average_rating: number | null;
}
export interface EntityFeedTag {
    id: number;
    name: string;
    tag_type: TagType;
}
export interface EntityFeedEntity {
    id: number;
    type: EntityType;
    title: string;
    images_json: string;
    tags: EntityFeedTag[];
    stances: EntityFeedStance[];
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}
export interface EntityFeedIssue extends EntityFeedEntity {
    type: EntityType.ISSUE;
}
export interface EntityFeedEvent extends EntityFeedEntity {
    type: EntityType.EVENT;
    start_time: string | null;
    end_time: string | null;
}

// stance feed models
export interface StanceFeedTag {
    id: number;
    name: string;
    tag_type: TagType;
}
export interface StanceFeedUser {
    id: number;
    username: string;
}
export interface StanceFeedEntity {
    id: number;
    type: number;
    title: string;
    images_json: string;
    tags: StanceFeedTag[];
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}
export interface StanceFeedStance {
    id: number;
    user: StanceFeedUser;
    entity: StanceFeedEntity;
    headline: string;
    content_json: string;
    average_rating?: number | null;
    num_ratings: number;
    my_rating?: number | null;
    tags: StanceFeedTag[];
    created_at?: string | null;
}

export interface StanceFeedRequest {
    num_stances?: number;
    entities?: number[];
}

export interface StanceFeedResponse {
    stances: StanceFeedStance[];
}


export interface Event extends Entity {
    type: EntityType.EVENT;
    start_time: string | null;
    end_time: string | null;
}

export interface Issue extends Entity {
    type: EntityType.ISSUE;
}

export enum EntityType {
    EVENT = 1,
    ISSUE = 2,
    LEGISLATION = 3,
    QUOTE = 4
}

export enum TagType {
    LOCATION = 1,
    TOPIC = 2
}

export interface Comment {
    id: number;
    user_id: number;
    parent_id?: number;
    content: string;
    likes: number;
    dislikes: number;
    user_reaction: "like" | "dislike" | null;
    count_nested_replies: number;
}

export interface Stance {
    id: number;
    user_id: number;
    entity_id: number;
    headline: string;
    content_json: string;
    comments: Comment[];
    average_rating: number | null;
    num_ratings: number;
}

export interface Tag {
    id: number;
    name: string;
    tag_type: TagType;
}

export interface Entity {
    id: number;
    type: EntityType;
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    images_json: string;
    stances: Stance[];
    tags: Tag[];
}