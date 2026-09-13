import { createHandler } from './handler.ts';

Deno.serve(createHandler(() => Deno.env.get('COST_PREDICTOR_GRANTS') ?? '[]'));
