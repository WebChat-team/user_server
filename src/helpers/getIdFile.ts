
export default function getBase64UID() {
 
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";

    let base64UID = "";
    for (let i = 0; i < 11; i++) {
        base64UID += chars[Math.floor(Math.random() * 64)];
    }

    return base64UID;
    
}