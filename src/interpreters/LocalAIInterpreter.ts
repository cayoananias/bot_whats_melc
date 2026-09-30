import { Draft } from '../types/finance'; import { MessageInterpreter } from './MessageInterpreter';
/** Future adapter: call a local Ollama instance only, validate JSON, and never give it Brudam credentials. */ export class LocalAIInterpreter implements MessageInterpreter { interpret(_message:string):Draft { throw new Error('LocalAIInterpreter is not configured. Set INTERPRETER=rules.'); } }
