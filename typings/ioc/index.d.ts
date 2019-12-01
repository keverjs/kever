import { InstanceMeta } from '../interface';
declare class InstancePoll {
    private providePoll;
    private injectPoll;
    add(type: Symbol, instanceMeta: InstanceMeta): void;
    has(type: Symbol, key: any): boolean;
    get(type: Symbol, key: any): any;
    getAll(type: Symbol): Map<any, any>;
}
export declare const instancePoll: InstancePoll;
export declare const Provide: (tag: any) => (target: any) => void;
export declare const Inject: (tag: any) => (target: any) => void;
export {};
