import { Headers, getHeadersHandler } from './headers';
import { Params, getParamsHeandler } from './params';
declare const Req: () => (target: any, propertyKey: string, paramIndex: number) => void;
declare const Res: () => (target: any, propertyKey: string, paramIndex: number) => void;
declare const Cookie: () => (target: any, propertyKey: string, paramIndex: number) => void;
export { Req, Res, Cookie, Headers, Params, getHeadersHandler, getParamsHeandler };
