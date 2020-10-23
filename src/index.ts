import 'reflect-metadata';
import { registerDi } from './di';
import server from './server';

registerDi();
server();
