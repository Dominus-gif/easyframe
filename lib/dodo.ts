const DODO_API_BASE =
  process.env.DODO_API_BASE_URL ??
  (process.env.DODO_ENVIRONMENT === "test" ? "https://test.dodopayments.com" : "https://live.dodopayments.com");

export async function cancelDodoSubscription(subscriptionId?: string | null) {
  const apiKey = process.env.DODO_API_KEY;
  if (!subscriptionId || !apiKey || apiKey === "dodo_sandbox_api_key") {
    return { ok: false, skipped: true };
  }

  const response = await fetch(`${DODO_API_BASE}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ status: "cancelled" }),
    cache: "no-store"
  });

  return { ok: response.ok, skipped: false, status: response.status };
}
