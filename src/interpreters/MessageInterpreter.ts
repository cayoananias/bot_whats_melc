import { Draft } from '../types/finance'; export interface MessageInterpreter { interpret(message: string, now?: Date): Draft; }
