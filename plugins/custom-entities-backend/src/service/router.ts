import {errorHandler} from '@backstage/backend-common';
import {LoggerService, RootConfigService} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import fs from 'fs';
import path from 'path';
import {Config} from "@backstage/config";
import {Storage} from '@google-cloud/storage';
import {PermissionEvaluator} from '@backstage/plugin-permission-common';
import {createPermissionIntegrationRouter} from '@backstage/plugin-permission-node';
import {
    customEntitiesUpdatePermission
} from '@telereso/backstage-plugin-custom-entities-common';

const storage = new Storage();

export interface RouterOptions {
    logger: LoggerService;
    config: RootConfigService;
    permissions: PermissionEvaluator;
}

function getProvider(config: Config) {
    if (config.getOptionalConfig("customEntities.providers.googleGcs"))
        return "gcp"
    return "local";
}

// Local
function getFilePath(config: Config) {
    const localConfig = config.getOptionalConfig("customEntities.providers.local");

    return path.join(__dirname,
        localConfig?.getOptionalString("dir") || '../../../../examples',
        localConfig?.getOptionalString("name") || "custom-entities.yaml"
    );
}

function getLocalEntities(config: Config, response: express.Response) {
    const localEntitiesYamlFile = getFilePath(config)

    if (!fs.existsSync(localEntitiesYamlFile)) {
        fs.writeFileSync(localEntitiesYamlFile, "")
    }
    // Set download headers
    response.setHeader('Content-Type', 'application/octet-stream');
    response.setHeader('Content-Disposition', `attachment; filename="custom-entities.yaml"`);

    // Read and stream the file content
    const stream = fs.createReadStream(localEntitiesYamlFile);
    stream.pipe(response);
}

async function saveLocalEntities(config: Config, request: express.Request, response: express.Response) {
    const localEntitiesYamlFile = getFilePath(config);

    let yamlString = '';

    // Read the request body data in chunks using async iterator
    for await (const chunk of request) {
        yamlString += chunk.toString();
    }
    fs.writeFileSync(localEntitiesYamlFile, yamlString)
    response.json({message: 'entities.yaml uploaded successfully!'});
}

// GCP

function getGcpInfo(config: Config) {
    const gcpConfig = config.getConfig("customEntities.providers.googleGcs")

    const bucket = gcpConfig.getString("bucket")
    const folder = gcpConfig.getOptionalString("folder") || "/backstage/catalog"
    const name = gcpConfig.getOptionalString("name") || "custom-entities.yaml"

    return {bucket, folder, name}
}

async function getGcpEntities(config: Config, response: express.Response) {
    const info = getGcpInfo(config)

    // Set download headers
    response.setHeader('Content-Type', 'application/octet-stream');
    response.setHeader('Content-Disposition', `attachment; filename="${info.name}"`);

    const found = await storage
        .bucket(info.bucket)
        .file(`${info.folder}/${info.name}`)
        .exists()

    if (found[0]) {
        // file found return file content
        const file = await storage
            .bucket(info.bucket)
            .file(`${info.folder}/${info.name}`)
            .download()

        response.status(200).send(String(file))
    } else {
        // file not found return empty
        response.status(200).send("")
    }
}

async function saveGcpEntities(config: Config, request: express.Request, response: express.Response) {
    const info = getGcpInfo(config)

    let yamlString = '';

    // Read the request body data in chunks using async iterator
    for await (const chunk of request) {
        yamlString += chunk.toString();
    }

    await storage
        .bucket(info.bucket)
        .file(`${info.folder}/${info.name}`)
        .save(yamlString)


    response.json({message: 'custom-entities.yaml uploaded successfully!'});
}

export async function createRouter(
    options: RouterOptions,
): Promise<express.Router> {
    const {logger} = options;

    const permissionIntegrationRouter = createPermissionIntegrationRouter({
        permissions: [customEntitiesUpdatePermission],
    });

    const router = Router();
    router.use(express.json());

    router.get('/health', (_, response) => {
        logger.info('PONG!');
        response.json({status: 'ok'});
    });

    router.get('/v1/entities.yaml', async (request, response) => {
        logger.debug('get entities.yaml');

        try {
            const url = new URL(options.config.getString("backend.baseUrl"))

            if (request.hostname != url.hostname) {
                response.status(401).json({message: `NotAllowed host ${request.hostname}`});
                return
            }

            switch (getProvider(options.config)) {
                case "gcp":
                    await getGcpEntities(options.config, response)
                    break;
                default:
                    getLocalEntities(options.config, response)
                    break;
            }

        } catch (error: unknown) { // Catch unknown error for type safety
            console.error(error);
            // You can optionally check the error type here (if defined)
            // and provide a more specific error message
            response.status(500).json({message: 'Error downloading file!'});
        }
    });

    router.use(permissionIntegrationRouter);

    router.post('/v1/entities.yaml', async (request, response) => {
        logger.debug('post entities.yaml');

        // TODO check user before update
        // const token = getBearerTokenFromAuthorizationHeader(
        //     request.header('authorization'),
        // );
        // const decision = (
        //     await permissions.authorize([{permission: customEntitiesUpdatePermission}], {
        //         token,
        //     })
        // )[0];
        //
        // if (decision.result === AuthorizeResult.DENY) {
        //     // throw new NotAllowedError('Unauthorized');
        // }

        try {
            switch (getProvider(options.config)) {
                case "gcp":
                    await saveGcpEntities(options.config, request, response)
                    break;
                default:
                    await saveLocalEntities(options.config, request, response)
                    break;
            }
        } catch (error) {
            console.error(error);
            response.status(500).json({message: 'Error uploading entities.yaml!'});
        }
    });

    router.use(errorHandler());
    return router;
}
