import { ParamsMetaInterface } from '../../interface';
import { Context } from 'koa';
export declare const Headers: (tags?: string[]) => (target: any, propertyKey: string, paramIndex: number) => void;
export declare const getHeadersHandler: (ctx: Context, paramMeta: ParamsMetaInterface) => any[];
