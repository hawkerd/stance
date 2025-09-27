
export interface Comment {
    id: number;
    user_id: number;
    parent_id?: number;
    content: string;
}

export interface Stance {
    id: number;
    user_id: number;
    stance: string;
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
