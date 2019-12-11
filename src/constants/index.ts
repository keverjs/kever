/**
 * @description 各可反射的常量标识
 */
export const META_ROUTER = Symbol.for('dectorator#meta_router')

export const META_CONTROLLER = Symbol.for('dectorator#meta_controller')

export const META_INJECT = Symbol.for('dectorator#meta_inject')

// doing
export const META_REQ = Symbol.for('decorator#meta_req')

export const META_RES = Symbol.for('decorator#meta_res')

export const META_HEADERS = Symbol.for('decorator#meta_headers')

export const META_PARAMS = Symbol.for('decorator#meta_params')

export const META_BODY = Symbol.for('decorator#meta_body')

export const META_COOKIE = Symbol.for('decorator#meta_cookie')

// TODO
export const META_PASSPORT = Symbol.for('decorator#meta_passport')

export const META_RPC_CLIENT = Symbol.for('decorator#meta_rpc_client')

export const META_RPC_SERVER = Symbol.for('decorator#meta_rpc_server')
