import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

function isValidationError(
  err: unknown,
): err is { issues: Array<{ path: Array<string | number>; message: string }> } {
  return Boolean(
    err &&
      typeof err === "object" &&
      "issues" in err &&
      Array.isArray((err as { issues?: unknown }).issues),
  );
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (process.env.NODE_ENV === "production" && configuredCorsOrigins.length === 0) {
  throw new Error(
    "CORS_ORIGINS environment variable must be set in production mode with at least one allowed origin (e.g., https://example.com,https://app.example.com).",
  );
}
const defaultDevCorsOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedCorsOrigins = new Set(
  configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : process.env.NODE_ENV === "production"
      ? []
      : defaultDevCorsOrigins,
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedCorsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("CORS origin is not allowed"));
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    if (isValidationError(err)) {
      res.status(400).json({
        error: "Validation failed",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("cors origin is not allowed")
    ) {
      res.status(403).json({ error: "CORS origin is not allowed" });
      return;
    }

    logger.error({ err }, "Unhandled API error");
    res.status(500).json({ error: "Internal server error" });
  },
);

export default app;
