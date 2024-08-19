import type {SoundcloudTrackSearchV2, SoundcloudTrackV2, SoundcloudUserFilterV2, SoundcloudUserSearchV2, SoundcloudUserV2, SoundcloudWebProfile, FollowersResponse} from "../types"
import {API} from "../API"
import {URL} from "url"
import {Resolve} from "./index"
import {request} from "undici"

export class Users {
    private readonly resolve = new Resolve(this.api)
    public constructor(private readonly api: API) {}

    /**
     * Searches for users using the v2 API.
     */
    public searchV2 = async (params?: SoundcloudUserFilterV2) => {
        const response = await this.api.getV2("search/users", params)
        return response as Promise<SoundcloudUserSearchV2>
    }

    /**
     * Fetches a user from URL or ID using Soundcloud v2 API.
     */
    public getV2 = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = await this.api.getV2(`/users/${userID}`)
        return response as Promise<SoundcloudUserV2>
    }

    /**
     * Gets all the tracks by the user using Soundcloud v2 API.
     */
    public tracksV2 = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = <SoundcloudTrackSearchV2>await this.api.getV2(`/users/${userID}/tracks`)
        let nextHref = response.next_href
        while (nextHref) {
            const url = new URL(nextHref)
            const params = {}
            url.searchParams.forEach((value, key) => (params[key] = value))
            const nextPage = <SoundcloudTrackSearchV2>await this.api.getURL(url.origin + url.pathname, params)
            response.collection.push(...nextPage.collection)
            nextHref = nextPage.next_href
        }
        return response.collection as SoundcloudTrackV2[]
    }

    /**
     * Gets all of a users liked tracks.
     */
    public likes = async (userResolvable: string | number, limit?: number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = <SoundcloudTrackSearchV2>await this.api.getV2(`/users/${userID}/likes`, {limit: 50, offset: 0})
        const tracks: SoundcloudTrackV2[] = []
        let nextHref = response.next_href
        while (nextHref && (!limit || tracks.length < limit)) {
            const url = new URL(nextHref)
            const params = {}
            url.searchParams.forEach((value, key) => (params[key] = value))
            const nextPage = <SoundcloudTrackSearchV2>await this.api.getURL(url.origin + url.pathname, params)
            tracks.push(...nextPage.collection)
            nextHref = nextPage.next_href
        }
        return tracks
    }

    /**
     * Gets all the web profiles on a users sidebar.
     */
    public webProfiles = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = await this.api.getV2(`/users/soundcloud:users:${userID}/web-profiles`)
        return <SoundcloudWebProfile[]>response
    }

    /**
     * Searches for users (web scraping)
     */
    public searchAlt = async (query: string) => {
        const headers = this.api.headers
        const html = await request(`https://soundcloud.com/search/people?q=${query}`, {headers}).then(r => r.body.text())
        const urls = html.match(/(?<=<li><h2><a href=")(.*?)(?=">)/gm)?.map((u: any) => `https://soundcloud.com${u}`)
        if (!urls) return []
        const scrape: any = []
        for (let i = 0; i < urls.length; i++) {
            const songHTML = await request(urls[i], {headers}).then(r => r.body.text())
            const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
            const user = json[json.length - 1].data
            scrape.push(user)
        }
        return scrape as Promise<SoundcloudUserV2[]>
    }

    /**
     * Gets a user by URL (web scraping)
     */
    public getAlt = async (url: string) => {
        if (!url.startsWith("https://soundcloud.com/")) url = `https://soundcloud.com/${url}`
        const headers = this.api.headers
        const songHTML = await request(url, {headers}).then(r => r.body.text())
        const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
        const user = json[json.length - 1].data
        return user as Promise<SoundcloudUserV2>
    }

    public followersV2 = async (
        userResolvable: string | number, 
        limit?: number
      ): Promise<SoundcloudUserV2[]> => {
        const user = await this.getV2(userResolvable);
        const userID = user.id;
        const totalFollowers = user.followers_count;
      
        let followers: SoundcloudUserV2[] = [];
        let nextHref: string | null = null;
        const pageSize = 200; // Maximum allowed by the API
        const maxRetries = 3;
        const retryDelay = 5000; // 5 seconds
      
        const handleResponse = (response: any): FollowersResponse => {
          if (typeof response === 'string') {
            try {
              return JSON.parse(response);
            } catch (e) {
              console.error('Error parsing response:', e);
              throw e;
            }
          }
          return response;
        };
      
        const logProgress = (current: number, total: number) => {
          console.log(`Retrieved ${current} out of ${total} followers`);
        };
      
        const fetchPage = async (url: string, params: any, attempt = 1): Promise<FollowersResponse> => {
          try {
            const response = await handleResponse(await this.api.getURL(url, params));
            return response;
          } catch (error) {
            console.error(`Error fetching followers (Attempt ${attempt}):`, error);
      
            if (attempt < maxRetries) {
              console.log(`Retrying in ${retryDelay / 1000} seconds...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              return fetchPage(url, params, attempt + 1);
            } else {
              throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
            }
          }
        };
      
        try {
          do {
            const requestLimit = limit ? Math.min(pageSize, limit - followers.length) : pageSize;
            let response: FollowersResponse;
      
            if (!nextHref) {
              // Initial request using getV2
              response = handleResponse(await this.api.getV2(`/users/${userID}/followers`, { limit: requestLimit }));
            } else {
              // Subsequent requests using the next_href
              const url = new URL(nextHref);
              const params: any = {};
              url.searchParams.forEach((value, key) => (params[key] = value));
              params['limit'] = requestLimit.toString();
      
              // Fetch the next page with retry logic
              response = await fetchPage(url.origin + url.pathname, params);
            }
      
            if (response && Array.isArray(response.collection)) {
              followers = followers.concat(response.collection);
              nextHref = response.next_href;
      
              logProgress(followers.length, limit || totalFollowers);
            } else {
              console.error('Unexpected response format:', JSON.stringify(response, null, 2));
              break;
            }
      
            // If we have a limit, stop when we hit it
            if (limit && followers.length >= limit) {
              followers = followers.slice(0, limit);
              break;
            }
      
          } while (nextHref && (!limit || followers.length < totalFollowers));
      
        } catch (error) {
          console.error('Error fetching followers:', error);
        }
      
        // Ensure that we didn't skip any due to odd API behavior or conditions
        if (followers.length > totalFollowers) {
          followers = followers.slice(0, totalFollowers);
        }
      
        return followers;
      }
    }      