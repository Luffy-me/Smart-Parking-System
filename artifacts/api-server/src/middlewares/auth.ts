import type { Request, Response, NextFunction, RequestHandler } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export type UserRole = "driver" | "operator";

export interface AuthInfo {
  userId: string;
  role: UserRole;
  email: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthInfo;
    }
  }
}

async function loadOrCreateUser(
  userId: string,
): Promise<{ id: string; role: UserRole; email: string | null }> {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  if (existing[0]) {
    return {
      id: existing[0].id,
      role: existing[0].role as UserRole,
      email: existing[0].email,
    };
  }

  let email: string | null = null;
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
  } catch {
    email = null;
  }

  return db.transaction(async (tx) => {
    // Serialize bootstrap role assignment so only one first-time user can become operator.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('users_bootstrap_operator_role'))`,
    );

    const [alreadyExists] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (alreadyExists) {
      return {
        id: alreadyExists.id,
        role: alreadyExists.role as UserRole,
        email: alreadyExists.email,
      };
    }

    // First user becomes the operator; everyone else is a driver.
    const [{ count }] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);
    const role: UserRole = count === 0 ? "operator" : "driver";

    const [inserted] = await tx
      .insert(usersTable)
      .values({ id: userId, role, email })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      return {
        id: inserted.id,
        role: inserted.role as UserRole,
        email: inserted.email,
      };
    }

    const [fallback] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (!fallback) {
      throw new Error("Failed to create or load user record");
    }
    return {
      id: fallback.id,
      role: fallback.role as UserRole,
      email: fallback.email,
    };
  });
}

export const requireAuth: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await loadOrCreateUser(userId);
    req.auth = { userId: user.id, role: user.role, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireOperator: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.auth.role !== "operator") {
    res.status(403).json({ error: "Operator role required" });
    return;
  }
  next();
};
