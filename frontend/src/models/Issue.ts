
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
    headline: string;
    content_json: string;
    comments: Comment[];
}

export interface Issue {
    id: number;
    title: string;
    description?: string;
    location?: string;
    stances: Stance[];
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    stances: Stance[];
}