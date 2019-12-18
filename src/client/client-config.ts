import { Config } from '../models';
import { ClientParams, ResponseHandler } from 'contensis-core-api';

export class ClientConfig implements Config {
    rootUrl: string = null;
    accessToken: string = null;
    defaultHeaders: { [key: string]: string } = null;
    projectId: string = null;
    language: string = null;
    versionStatus: 'published' | 'latest' = 'published';
    pageSize: number = 25;
    responseHandler: ResponseHandler = null;

    constructor(private currentConfig: Config, private previousConfig: Config) {
        this.rootUrl = this.getValue((c) => c.rootUrl);
        this.accessToken = this.getValue((c) => c.accessToken);
        this.defaultHeaders = this.getValue((c) => c.defaultHeaders);
        this.projectId = this.getValue((c) => c.projectId);
        this.language = this.getValue((c) => c.language);
        this.versionStatus = this.getValue((c) => c.versionStatus);
        this.pageSize = this.getValue((c) => c.pageSize);
        this.responseHandler = this.getValue((c) => c.responseHandler);

        while (this.rootUrl && this.rootUrl.substr(this.rootUrl.length - 1, 1) === '/') {
            this.rootUrl = this.rootUrl.substr(0, this.rootUrl.length - 1);
        }
    }

    toParams(): ClientParams {
        return {
            rootUrl: this.rootUrl,
            accessToken: this.accessToken,
            defaultHeaders: this.defaultHeaders,
            language: this.language,
            versionStatus: this.versionStatus,
            projectId: this.projectId,
            pageIndex: 0,
            pageSize: this.pageSize,
            responseHandler: this.responseHandler
        };
    }

    private getValue<T>(getter: (c: Config) => T): T {
        let result = null;
        if (this.currentConfig) {
            result = getter(this.currentConfig);
        }
        if (this.previousConfig && !result) {
            result = getter(this.previousConfig);
        }
        return result || getter(this);
    }
}
