"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = (rootPath, path) => {
    if (rootPath === '/') {
        return path;
    }
    return `${rootPath}${path}`;
};
