import type { WarEvent } from "$lib/types";

export async function load({ fetch }) {
  const response = await fetch("api/war_events");
  const war_events: WarEvent[] = await response.json();
  return { war_events };
}