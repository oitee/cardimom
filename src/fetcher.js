import fetch from "node-fetch";
export async function fetcher(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (e) {}
}

