import { RouteAop } from '../interface';
export declare const Get: (path: string, aopPlugins?: RouteAop) => (target: any, propertyKey: string, descripator: PropertyDescriptor) => void;
export declare const Post: (path: string, aopPlugins?: RouteAop) => (target: any, propertyKey: string, descripator: PropertyDescriptor) => void;
export declare const Put: (path: string, aopPlugins?: RouteAop) => (target: any, propertyKey: string, descripator: PropertyDescriptor) => void;
export declare const Delete: (path: string, aopPlugins?: RouteAop) => (target: any, propertyKey: string, descripator: PropertyDescriptor) => void;
