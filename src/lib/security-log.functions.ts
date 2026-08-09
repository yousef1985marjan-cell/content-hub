import { createServerFn } from "@tanstack/react-start";
import { requireLocalAuth } from "./local-auth-middleware";
import type { JsonValue } from "./json";

type LocalAuditRow = {
  id: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  metadata_json: string;
  created_at: string;
};

function normalizeAuditRow(row: LocalAuditRow) {
  let metadata: Record<string, JsonValue> = {};
  try {
    metadata = JSON.parse(row.metadata_json || "{}") as Record<string, JsonValue>;
  } catch {
    metadata = {};
  }
  return {
    id: row.id,
    created_at: row.created_at,
    event_type: row.action,
    actor_id: row.actor_user_id,
    actor_email: row.actor_email || (typeof metadata.actorEmail === "string" ? metadata.actorEmail : null),
    target_email: row.target_email,
    status: metadata.status === "failure" ? "failure" : "success",
    details:
      metadata.details && typeof metadata.details === "object"
        ? (metadata.details as Record<string, JsonValue>)
        : metadata,
  };
}

export const listSecurityEvents = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .inputValidator((data: { event?: string; email?: string; limit?: number }) => data ?? {})
  .handler(async ({ data }) => {
    const { listLocalSecurityEvents, requireLocalAdmin } = await import("./local-auth.server");
    requireLocalAdmin();
    const requestedLimit = Math.min(Math.max(data.limit ?? 100, 1), 500);
    const rows = listLocalSecurityEvents(500) as unknown as LocalAuditRow[];
    const emailNeedle = data.email?.trim().toLowerCase();
    const events = rows
      .map(normalizeAuditRow)
      .filter((row) => !data.event || row.event_type === data.event)
      .filter((row) => {
        if (!emailNeedle) return true;
        return [row.actor_email, row.target_email].some((value) => value?.toLowerCase().includes(emailNeedle));
      })
      .slice(0, requestedLimit);
    return { events };
  });

export const sendReferenceEmailTest = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .handler(async () => {
    const { requireLocalAdmin } = await import("./local-auth.server");
    const actor = requireLocalAdmin();
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "auth.reference_email_test",
      actorId: actor.id,
      actorEmail: actor.email,
      details: { source: "admin_panel" },
    });
    return { ok: true };
  });

export const logSelfSignIn = createServerFn({ method: "POST" })
  .middleware([requireLocalAuth])
  .handler(async ({ context }) => {
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.signed_in",
      actorId: context.user.id,
      actorEmail: context.user.email,
    });
    return { ok: true };
  });

export const logSelfPasswordResetRequest = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    if (!data.email || !data.email.includes("@")) throw new Error("بريد غير صالح");
    return data;
  })
  .handler(async ({ data }) => {
    const { logSecurityEvent } = await import("./security-log.server");
    await logSecurityEvent({
      event: "user.password_reset_self_requested",
      targetEmail: data.email,
    });
    return { ok: true };
  });
