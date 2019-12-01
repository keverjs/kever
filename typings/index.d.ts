import 'reflect-metadata';
import { Inject, Provide } from './ioc';
import { Get, Post, Put, Delete, All } from './decorator/httpRouter';
import { createApplication, Controller } from './core';
export { createApplication, Inject, Provide, Get, Post, Put, Delete, All, Controller };
