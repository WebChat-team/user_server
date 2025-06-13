import type { JwtPayload } from "jsonwebtoken";

interface UserDataInJwtPayload {
    user_id: number
}

export function isUserDataFromJWT(userData: JwtPayload | null | string): userData is UserDataInJwtPayload {
    return (
        typeof userData === "object" &&
        userData !== null &&
        !Array.isArray(userData) &&
        "user_id" in userData
    );
}