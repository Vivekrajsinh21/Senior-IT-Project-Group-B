import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { auth } from "../auth.js";
import { serializeSignedCookie } from "better-call";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}


/**
 * Verify a short-lived JWT created by the trusted ApexTrainer AI Gateway.
 *
 * Security properties:
 * - The token signature is verified using a shared secret.
 * - The issuer must be "apextrainer-ai-gateway".
 * - The audience must be "apextrainer-mcp".
 * - Expired tokens are rejected automatically.
 * - The JWT "sub" claim becomes the trusted ApexTrainer user ID.
 *
 * The browser and Langflow cannot forge this token because they do not know
 * MCP_GATEWAY_JWT_SECRET.
 */
async function verifyGatewayJwt(
  token: string
): Promise<string | null> {
  const secret = process.env.MCP_GATEWAY_JWT_SECRET?.trim();

  // If the shared secret is not configured, JWT authentication is disabled.
  // This allows the existing Better Auth API-key/session authentication
  // mechanism to continue working during migration.
  if (!secret) {
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(
      token,
      secretKey,
      {
        algorithms: ["HS256"],
        issuer: "apextrainer-ai-gateway",
        audience: "apextrainer-mcp",
      }
    );

    // "sub" contains the authenticated ApexTrainer user ID.
    if (
      typeof payload.sub !== "string" ||
      !payload.sub.trim()
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    // This is intentionally not logged with the token value.
    // A failure here does not immediately reject the request because the
    // request may still contain a valid Better Auth API key/session token.
    return null;
  }
}


/**
 * Authenticate an MCP HTTP request.
 *
 * Supported authentication methods:
 *
 * 1. Gateway JWT
 *    Authorization: Bearer <short-lived JWT>
 *
 *    Used by:
 *      Browser -> AI Gateway -> Langflow -> MCP
 *
 *    The JWT "sub" identifies the currently logged-in ApexTrainer user.
 *
 * 2. Better Auth API key
 *    x-api-key: <api-key>
 *
 * 3. Better Auth API key passed as Bearer token
 *    Authorization: Bearer <api-key>
 *
 * 4. Better Auth session token passed as Bearer token
 *
 * Keeping the old methods allows existing MCP tests and integrations to
 * continue working while production chat moves to per-user JWT auth.
 */
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    // =========================================================================
    // Authentication path 1:
    // Short-lived JWT from ApexTrainer AI Gateway.
    // =========================================================================

    if (
      authorization?.startsWith("Bearer ")
    ) {
      const token = authorization
        .slice("Bearer ".length)
        .trim();

      if (token) {
        const gatewayUserId = await verifyGatewayJwt(token);

        if (gatewayUserId) {
          req.userId = gatewayUserId;

          // We deliberately do not trust user information from Langflow.
          // The only trusted identity here is the signed JWT subject.
          req.user = {
            id: gatewayUserId,
          };

          return next();
        }
      }
    }

    // =========================================================================
    // Authentication paths 2-4:
    // Existing Better Auth authentication.
    // =========================================================================

    if (
      authorization?.startsWith("Bearer ")
    ) {
      const token = authorization
        .slice("Bearer ".length)
        .trim();

      if (token) {
        // Better Auth API keys used by this project are long opaque strings.
        // Map them to x-api-key so the Better Auth API-key plugin can verify
        // them normally.
        if (
          token.length >= 64 &&
          !token.includes(".")
        ) {
          req.headers["x-api-key"] = token;
        } else {
          // If it is not an API key and was not a valid Gateway JWT,
          // treat it as a Better Auth session token.
          //
          // Better Auth expects the session token as a signed cookie,
          // so we create the same cookie format used by the main app.
          const prefix = "sparky";
          const cookieName = `${prefix}.session_token`;

          const secretStr = Buffer.isBuffer(
            auth.options.secret
          )
            ? auth.options.secret.toString()
            : String(auth.options.secret);

          const signed = await serializeSignedCookie(
            "",
            token,
            secretStr
          );

          const signedValue = signed.replace(
            "=",
            ""
          );

          const cookieHeader =
            `${cookieName}=${signedValue}`;

          req.headers.cookie =
            req.headers.cookie
              ? `${req.headers.cookie}; ${cookieHeader}`
              : cookieHeader;
        }
      }
    }

    // Ask Better Auth to resolve the authenticated session/user.
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (
      session &&
      session.user
    ) {
      req.userId = session.user.id;
      req.user = session.user;

      return next();
    }

    res.status(401).json({
      error:
        "Authentication required. Provide a valid Gateway JWT, Better Auth API key, or session.",
    });
  } catch (error) {
    console.error(
      "[MCP] Auth error:",
      error
    );

    res.status(500).json({
      error:
        "Internal authentication error",
    });
  }
}
