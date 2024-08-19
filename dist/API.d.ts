import { Pool } from "undici";
export declare class API {
    oauthToken?: string;
    static headers: Record<string, any>;
    api: Pool;
    apiV2: Pool;
    web: Pool;
    proxy?: Pool;
    private clientIds;
    private currentClientIdIndex;
    constructor(clientIds?: string[], oauthToken?: string, proxy?: string);
    private get currentClientId();
    private rotateClientId;
    get headers(): Record<string, any>;
    get: (endpoint: string, params?: Record<string, any>) => Promise<unknown>;
    getV2: (endpoint: string, params?: Record<string, any>) => Promise<unknown>;
    getWebsite: (endpoint: string, params?: Record<string, any>) => Promise<unknown>;
    getURL: (URI: string, params?: Record<string, any>) => Promise<unknown>;
    private readonly buildOptions;
    private readonly request;
    private readonly getRequest;
    post: (endpoint: string, params?: Record<string, any>) => Promise<unknown>;
    getClientIdWeb: () => Promise<string>;
    getClientIdMobile: () => Promise<string>;
    getClientId: (reset?: boolean) => Promise<string>;
}
