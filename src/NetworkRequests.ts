// @ts-ignore
import * as qs from 'qs';

const BASE_URL = 'https://www.reddit.com/';

export let networkRequests: any = {
    getUserDetails: async (): Promise<any> => {
        try {
            const response = await fetch(`${BASE_URL}api/me.json`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Fetching User Information failed with Error: ${error}`);
        }
    },

    getComments: async (username: string, queryString: string = ''): Promise<any> => {
        try {
            const response = await fetch(`${BASE_URL}user/${username}/comments/.json${queryString}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Fetching comments failed with Error: ${error}`);
        }
    },

    editComment: async (data: any, uh: string) => {
        try {
            const response = await fetch(`${BASE_URL}api/editusertext`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Modhash': uh
                },
                body: qs.stringify(data),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Edit comment request failed with status: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Editing comment failed with Error: ${error}`);
        }
    },

    deleteRedditThing: async (data: any, uh: string) => {
        try {
            const response = await fetch(`${BASE_URL}api/del`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Modhash': uh
                },
                body: qs.stringify(data),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Delete request failed with status: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Deleting item failed with Error: ${error}`);
        }
    },

    getPosts: async (username: string, queryString: string = ''): Promise<any> => {
        try {
            const response = await fetch(`${BASE_URL}user/${username}/submitted/.json${queryString}`, {
                method: 'GET',
                headers: {
                    'Accept': '*/*'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Fetching posts failed with Error: ${error}`);
        }
    },
};
