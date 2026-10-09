export interface SettingsRequest {
  opener: HTMLElement | null;
}

let listener: ((request: SettingsRequest) => void) | undefined;
let pending: SettingsRequest | undefined;

/** A tap before the settings island is hydrated must not be lost. */
export function openSettings(opener?: HTMLElement | null): void {
  const request = { opener: opener ?? null };
  if (listener) listener(request);
  else pending = request;
}

export function subscribeSettingsOpen(onOpen: (request: SettingsRequest) => void): () => void {
  listener = onOpen;
  if (pending) {
    const request = pending;
    pending = undefined;
    onOpen(request);
  }
  return () => {
    if (listener === onOpen) listener = undefined;
  };
}
