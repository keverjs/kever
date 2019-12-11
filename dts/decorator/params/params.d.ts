import { Context } from 'koa';
import { ParamsMetaInterface } from '../../interface';
export declare const Params: (tags?: string[]) => (target: any, propertyKey: string, paramIndex: number) => void;
export declare const getParamsHeandler: (ctx: Context, paramMeta: ParamsMetaInterface) => any[];
