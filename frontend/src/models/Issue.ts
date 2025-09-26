export interface Stance {
    id: number;
    user_id: number;
    stance: string;
}

export interface Issue {
    id: number;
    title: string;
    description?: string;
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
