// Home feed models
export interface HomeFeedStance {
    id: number;
    headline: string;
    average_rating: number | null;
}
export interface HomeFeedTag {
    id: number;
    name: string;
    tag_type: TagType;
}
export interface HomeFeedEntity {
    id: number;
    type: EntityType;
    title: string;
    images_json: string;
    tags: HomeFeedTag[];
    stances: HomeFeedStance[];
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
}
export interface HomeFeedIssue extends HomeFeedEntity {
    type: EntityType.ISSUE;
}
export interface HomeFeedEvent extends HomeFeedEntity {
    type: EntityType.EVENT;
    start_time: string | null;
    end_time: string | null;
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