import 'dotenv/config';
import { z } from 'zod';
export const env = z.object({ DATABASE_URL:z.string(), PORT:z.coerce.number().default(3000), JWT_SECRET:z.string().min(16), INTERPRETER:z.enum(['rules','ollama']).default('rules'), BRUDAM_MODE:z.enum(['mock','api']).default('mock') }).parse(process.env);
