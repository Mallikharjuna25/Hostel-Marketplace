// This project has migrated from Prisma/PostgreSQL to Mongoose/MongoDB.
// If any old routes still import from here, they'll fail immediately with a clear error.
// Migrate those routes to use @/lib/mongoose and @/lib/models instead.
export const prisma = new Proxy({} as any, {
  get(_target, prop) {
    throw new Error(
      `[MIGRATION ERROR] Old Prisma route still calling prisma.${String(prop)}. ` +
      `Migrate to Mongoose: import connectDB from '@/lib/mongoose'; import { ModelName } from '@/lib/models'`
    )
  },
})
