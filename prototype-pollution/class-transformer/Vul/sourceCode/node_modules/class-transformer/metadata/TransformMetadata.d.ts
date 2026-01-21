import { TransformOptions } from "./ExposeExcludeOptions";
export declare class TransformMetadata {
    target: Function;
    propertyName: string;
    transformFn: (value: any) => any;
    options: TransformOptions;
    constructor(target: Function, propertyName: string, transformFn: (value: any) => any, options: TransformOptions);
}
