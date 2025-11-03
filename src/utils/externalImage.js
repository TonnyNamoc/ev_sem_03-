import crypto from "crypto";

export function getRandomProductImageURL() {
    const seed = crypto.randomUUID();
    return `https://picsum.photos/seed/${seed}/600/400`;
}
