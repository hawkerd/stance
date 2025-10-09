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
}

export interface Entity {
    id: number;
    type: EntityType;
    title: string;
    description?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    stances: Stance[];
}