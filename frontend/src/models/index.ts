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
    latest_action_date?: string | null;
    latest_action_text?: string | null;
}
export interface EntityFeedIssue extends EntityFeedEntity {
    type: EntityType.ISSUE;
}
export interface EntityFeedEvent extends EntityFeedEntity {
    type: EntityType.EVENT;
    start_time: string | null;
    end_time: string | null;
}
export interface EntityFeedLegislation extends EntityFeedEntity {
    type: EntityType.LEGISLATION;
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
    avatar_url: string | null;
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
    num_comments: number;
    average_rating?: number | null;
    num_ratings: number;
    my_rating?: number | null;
    tags: StanceFeedTag[];
    created_at?: string | null;
}


// paginated stances by entity
export interface PaginatedStanceByEntityCursor {
    score: number;
    id: number;
}
export interface PaginatedStanceByEntityRequest {
    num_stances: number;
    cursor?: PaginatedStanceByEntityCursor | null;
}
export interface PaginatedStancesByEntityResponse {
    stances: StanceFeedStance[];
    next_cursor?: PaginatedStanceByEntityCursor | null;
}
export interface PaginatedStancesByEntityStance {
    id: number;
    user: StanceFeedUser;
    headline: string;
    content_json: string;
    num_comments: number;
    average_rating?: number | null;
    num_ratings: number;
    my_rating?: number | null;
    tags: StanceFeedTag[];
    created_at?: string | null;
}

export interface PaginatedStancesByUserStance {
    id: number;
    entity: StanceFeedEntity;
    headline: string;
    content_json: string;
    num_comments: number;
    average_rating?: number | null;
    num_ratings: number;
    my_rating?: number | null;
    tags: StanceFeedTag[];
    created_at?: string | null;
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
    unique_id: string;
    type: EntityType;
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    images_json: string;
    tags: Tag[];
    latest_action_date?: string | null;
    latest_action_text?: string | null;
}

export interface User {
    id: number;
    username: string;
    full_name: string;
    email: string;
}

export interface Profile {
    id: number;
    bio?: string | null;
    avatar_url?: string | null;
    pinned_stance_id?: number | null;
}

export interface ProfilePage {
    username: string;
    full_name: string;
    follower_count: number;
    following_count: number;
    following: boolean | null;
    bio: string | null;
    avatar_url: string | null;
    pinned_stance_id: number | null;
    pinned_stance_entity_id: number | null;
}
