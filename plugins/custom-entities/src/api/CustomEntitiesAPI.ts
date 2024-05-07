// Import core libraries
import {
    ConfigApi,
    createApiRef,
    FetchApi
} from '@backstage/core-plugin-api';

// Define API default path
const DEFAULT_PATH = '/api/custom-entities';

// Define API options
export type Options = {
    configApi: ConfigApi;
    fetchApi: FetchApi;
};

// Defining API client interface
export interface CustomEntitiesApi {
    getLocation(): string;

    fetchCustomEntitiesYaml(): Promise<string>;

    saveCustomEntitiesYaml(yamlString: string): Promise<void>;
}

// Create an API reference
export const CustomEntitiesApiRef = createApiRef<CustomEntitiesApi>({
    id: 'plugin.custom-entities-api.service',
});

const ENTITIES_PATH = '/v1/entities.yaml'

// Create the API client
export class CustomEntitiesApiClient implements CustomEntitiesApi {


    private readonly configApi: ConfigApi;
    private readonly fetchApi: FetchApi;

    // Declare constructor
    constructor(options: Options) {
        this.configApi = options.configApi;
        this.fetchApi = options.fetchApi;
    }


// Obtain baseURL
    private getBaseUrl() {
        return `${this.configApi.getString('backend.baseUrl')}${DEFAULT_PATH}`;
    }

    // create method to fetch data
    private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const resp = await this.fetchApi.fetch(`${baseUrl}${input}`, init);
        if (!resp.ok) throw new Error(resp.statusText);
        return await resp.json();
    }

    private async fetchString(input: string, init?: RequestInit): Promise<string> {
        const baseUrl = this.getBaseUrl();
        const resp = await this.fetchApi.fetch(`${baseUrl}${input}`, init);
        if (!resp.ok) throw new Error(resp.statusText);
        return await resp.text();
    }

    getLocation(): string {
        return `${this.getBaseUrl()}${ENTITIES_PATH}`
    }

    async fetchCustomEntitiesYaml(): Promise<string> {
        return await this.fetchString(ENTITIES_PATH);
    }

    async saveCustomEntitiesYaml(yamlString: string): Promise<void> {
        await this.fetch<string>(ENTITIES_PATH, {
            method: "POST",
            headers: {
                'Content-Type': 'text/plain'
            }, body: yamlString
        });
    }
}