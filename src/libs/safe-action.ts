import type { z } from 'zod';
/* eslint-disable no-console */
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action';

class ActionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ActionError';
  }
}

type ActionContext = {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    name?: string | null;
  };
};

const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error('Action error:', e);

    if (e instanceof ActionError) {
      return {
        message: e.message,
        code: e.code,
      };
    }

    return {
      message: DEFAULT_SERVER_ERROR_MESSAGE,
      code: 'INTERNAL_ERROR',
    };
  },
});

export const authActionClient = createSafeActionClient({
  handleServerError(e) {
    console.error('Action error:', e.message);

    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next }) => {
  const user = 1;

  if (!user) {
    throw new ActionError('Authentication required', 'UNAUTHORIZED');
  }

  return next({ ctx: { user } });
});

// export function createProtectedAction<TInput, TOutput>(
//   actionName: string,
//   schema: z.Schema<TInput>,
//   handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>,
//   requiredRole?: 'admin' | 'user',
// ) {
//   return authActionClient
//     .schema(schema)
//     .use(async ({ next, ctx }) => {
//       const user = 1;

//       if (requiredRole) {
//         throw new ActionError(
//           `This action requires ${requiredRole} role`,
//           'FORBIDDEN',
//         );
//       }

//       console.log(`Executing action: ${actionName}`);
//       const startTime = performance.now();

//       const result = await next({ ctx: { user: user! } });

//       const endTime = performance.now();
//       console.log(`Action ${actionName} took ${endTime - startTime}ms`);

//       return result;
//     })
//     .action((input: ActionInput, ctx: { user: number } & object, meta: readonly []) => handler(input, ctx.ctx));
// }

export function createPublicAction<TInput, TOutput>(
  actionName: string,
  schema: z.Schema<TInput>,
  handler: (input: TInput) => Promise<TOutput>,
) {
  return actionClient
    .schema(schema)
    .use(async ({ next }) => {
      console.log(`Executing public action: ${actionName}`);
      const startTime = performance.now();

      const result = await next();

      const endTime = performance.now();
      console.log(`Public action ${actionName} took ${endTime - startTime}ms`);

      return result;
    })
    .action(({ parsedInput }: { parsedInput: TInput }) => handler(parsedInput));
}
