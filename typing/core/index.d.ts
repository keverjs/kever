import { RuntimeOptions } from '../interface';
export declare const createApplication: (options?: RuntimeOptions) => any;
export declare const Controller: (path?: string) => <T extends new (...args: any[]) => {}>(constructor: T) => T;
