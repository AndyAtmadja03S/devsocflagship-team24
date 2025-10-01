// src/server/events/commitEmitter.ts
import { EventEmitter } from "events";

export const commitEmitter = new EventEmitter();

commitEmitter.setMaxListeners(100);
