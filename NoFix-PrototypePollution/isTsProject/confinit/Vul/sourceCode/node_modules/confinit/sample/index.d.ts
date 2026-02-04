/// <reference types="node" />
import * as confinit from "../index";
export declare class Section1Config implements confinit.IConfigSection {
    url: string;
    validate(): void;
}
export declare class WebServerConfig implements confinit.IConfigSection {
    port: number;
    constructor();
    validate(): void;
}
export declare class Configuration {
    readonly section1: Section1Config;
    readonly webServer: WebServerConfig;
    constructor(env?: NodeJS.ProcessEnv);
}
