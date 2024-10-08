import type { SoundcloudTrackV2, SoundcloudUserFilterV2, SoundcloudUserSearchV2, SoundcloudUserV2, SoundcloudWebProfile } from "../types";
import { API } from "../API";
export declare class Users {
    private readonly api;
    private readonly resolve;
    constructor(api: API);
    /**
     * Searches for users using the v2 API.
     */
    searchV2: (params?: SoundcloudUserFilterV2) => Promise<SoundcloudUserSearchV2>;
    /**
     * Fetches a user from URL or ID using Soundcloud v2 API.
     */
    getV2: (userResolvable: string | number) => Promise<SoundcloudUserV2>;
    /**
     * Gets all the tracks by the user using Soundcloud v2 API.
     */
    tracksV2: (userResolvable: string | number) => Promise<SoundcloudTrackV2[]>;
    /**
     * Gets all of a users liked tracks.
     */
    likes: (userResolvable: string | number, limit?: number) => Promise<SoundcloudTrackV2[]>;
    /**
     * Gets all the web profiles on a users sidebar.
     */
    webProfiles: (userResolvable: string | number) => Promise<SoundcloudWebProfile[]>;
    /**
     * Searches for users (web scraping)
     */
    searchAlt: (query: string) => Promise<SoundcloudUserV2[]>;
    /**
     * Gets a user by URL (web scraping)
     */
    getAlt: (url: string) => Promise<SoundcloudUserV2>;
    followersV2(userResolvable: string | number, offset?: number, limit?: number): Promise<{
        followers: SoundcloudUserV2[];
        nextOffset?: number;
    }>;
}
