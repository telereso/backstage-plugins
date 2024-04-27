// Import core libraries
import {
    ConfigApi,
    createApiRef,
} from '@backstage/core-plugin-api';

// Define API default path
const DEFAULT_PATH = '/api/custom-entities';

// Define API options
export type Options = {
    configApi: ConfigApi;
};

// Defining API client interface
export interface CustomEntitiesApi {
    fetchCustomEntitiesYaml(): Promise<string>;

    saveCustomEntitiesYaml(yamlString: string): Promise<void>;
}

// Create an API reference
export const CustomEntitiesApiRef = createApiRef<CustomEntitiesApi>({
    id: 'plugin.custom-entities-api.service',
});

// Create the API client
export class CustomEntitiesApiClient implements CustomEntitiesApi {


    private readonly configApi: ConfigApi;

    // Declare constructor
    constructor(options: Options) {
        this.configApi = options.configApi;
    }


// Obtain baseURL
    private getBaseUrl() {
        return `${this.configApi.getString('backend.baseUrl')}${DEFAULT_PATH}`;
    }

    // create method to fetch data
    private async fetch<T = any>(input: string, init?: RequestInit): Promise<T> {
        const baseUrl = this.getBaseUrl();
        const resp = await fetch(`${baseUrl}${input}`, init);
        if (!resp.ok) throw new Error(resp.statusText);
        return await resp.json();
    }

    private async fetchString(input: string, init?: RequestInit): Promise<string> {
        const baseUrl = this.getBaseUrl();
        const resp = await fetch(`${baseUrl}${input}`, init);
        if (!resp.ok) throw new Error(resp.statusText);
        return await resp.text();
    }

    async fetchCustomEntitiesYaml(): Promise<string> {
        return await this.fetchString('/v1/entities.yaml');
    }

    async saveCustomEntitiesYaml(yamlString: string): Promise<void> {
        await this.fetch<string>('/v1/entities.yaml', {
            method: "POST",
            headers: {
                'Content-Type': 'text/plain'
            }, body: yamlString
        });
    }
}