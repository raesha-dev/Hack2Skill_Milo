const API_ROOT = import.meta.env.VITE_BACKEND_API;// local testing


async function checkResponse(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export async function chatWithBot(message: string) {
  const res = await fetch(`${API_ROOT}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return checkResponse(res);
}

export async function analyzeSentiment(text: string) {
  const res = await fetch(`${API_ROOT}/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return checkResponse(res);
}

export async function generateTTS(text: string): Promise<{ audio_url: string }> {
  const res = await fetch(`${API_ROOT}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return checkResponse(res);
}

export async function saveMood(mood: object) {
  const res = await fetch(`${API_ROOT}/mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mood),
  });
  return checkResponse(res);
}

export async function getRecentMoods() {
  const res = await fetch(`${API_ROOT}/mood`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return checkResponse(res);
}

/**
 * Plays audio from the provided URL.
 * Returns a Promise that resolves when audio finishes playing or rejects on error.
 *
 * @param url - The URL of the audio to play
 */
export function playAudioFromUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = (event) => reject(new Error("Failed to play audio."));
    audio.play().catch(reject);
  });
}
