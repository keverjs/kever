declare class InstancePoll {
    private injectablePoll;
    add(key: symbol | string, instance: any): void;
    has(key: symbol | string): boolean;
    get(key: symbol | string): any;
}
export declare const instancePoll: InstancePoll;
export declare const Injectable: (tag: string | symbol) => (target: any) => void;
export declare const Inject: (tag: string | symbol) => (target: any, propertyKey: string) => void;
export {};
