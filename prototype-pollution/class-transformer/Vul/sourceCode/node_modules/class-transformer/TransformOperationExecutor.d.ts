import { ClassTransformOptions } from "./ClassTransformOptions";
export declare type TransformationType = "plainToClass" | "classToPlain" | "classToClass";
export declare class TransformOperationExecutor {
    private transformationType;
    private options;
    private transformedTypes;
    constructor(transformationType: TransformationType, options: ClassTransformOptions);
    transform(source: Object | Object[] | any, value: Object | Object[] | any, targetType: Function, arrayType: Function, isMap: boolean, level?: number): any;
    private applyCustomTransformations(value, target, key);
    private isCircular(object, level);
    private getReflectedType(target, propertyName);
    private getKeys(target, object);
    private checkVersion(since, until);
    private checkGroups(groups);
}
