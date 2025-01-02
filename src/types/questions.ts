export interface Question {
    id: string;
    serialNumber: string;
    text: string;
    category: string;
    answer: string;
    elaboration: string;
    requiresFriendInput?: boolean;
    friendResponses?: FriendResponse[];
}

export interface Category {
    id: string;
    title: string;
    description: string;
    baseNumber: number;
}

export interface FriendResponse {
    id: string;
    questionId: string;
    friendName: string;
    answer: string;
    createdAt: Date;
}

export interface ShareableLink {
    id: string;
    userId: string;
    createdAt: Date;
}
