import fetch from "node-fetch";
export async function fetcher(url) {
  try {
    const response = await fetch(url, {headers: { 'Content-Type': 'application/xml' }, timeout: 5000});
    return await response.text();
  } catch (e) {}
}

