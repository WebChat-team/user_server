// types ==================================================== //
interface Video {
    id: string,
    user_id: number,
    name: string,
    description: string,
    has_comments: boolean,
    has_load: boolean,
    level_access: "link" | "public" | "limited"
    age_linmit: "0" | "6" | "12" | "16" | "18",
}
interface Photo {
    id: string,
    user_id: number,
}

// exports ================================================== //
export type { Video, Photo };