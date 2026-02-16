export interface ProgressEvent {
  event: string;
  [key: string]: unknown;
}

export async function reportProgress(
  webhookUrl: string | undefined,
  payload: ProgressEvent,
): Promise<void> {
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Webhook is optional — fail silently
  }
}
