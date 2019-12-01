import 'reflect-metadata'

import { Inject, Injectable } from './ioc'
import { Get, Post, Put, Delete, All } from './decorator/httpRouter'
import { createApplication, Controller } from './core'

export {
  createApplication,
  Inject,
  Injectable,
  Get,
  Post,
  Put,
  Delete,
  All,
  Controller
}
