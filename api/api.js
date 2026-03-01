const LINKNYC_ENDPOINT =
  "https://data.cityofnewyork.us/api/v3/views/n6c5-95xh/query.json";

const buildHeaders = () => {
  const headers = { Accept: "application/json" };
  const token = process.env.EXPO_PUBLIC_NYC_APP_TOKEN;
  if (token) {
    headers["X-App-Token"] = token;
  }
  return headers;
};

const buildUrl = (baseUrl, params) => {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  if (!serialized) {
    return baseUrl;
  }

  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}${serialized}`;
};

const safeReadError = async (response) => {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch (error) {
    return "Unable to read error response body.";
  }
};

const fetchWithHandling = async (endpoint, params) => {
  const url = buildUrl(endpoint, params);
  const response = await fetch(url, {
    headers: buildHeaders(),
  });

  if (!response.ok) {
    const details = await safeReadError(response);
    throw new Error(
      `NYC Open Data request failed (${response.status} ${response.statusText}): ${details}`
    );
  }

  return response.json();
};

export const fetchLinkNYCData = (params = {}) =>
  fetchWithHandling(LINKNYC_ENDPOINT, params);
