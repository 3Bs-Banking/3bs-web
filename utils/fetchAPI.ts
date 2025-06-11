const BASE_URL = "http://localhost:5000/api/";

export async function fetchAPI(
  endpoint: string,
  options?: {
    method?: string;
    body?: Record<string, any>;
    headers?: Record<string, string>;
  }
) {
  const url = BASE_URL + endpoint;

  const fetchOptions: RequestInit = {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}), // ✅ custom headers if needed
    },
    credentials: "include", // ✅ keeps session cookie
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);

  // Optional: handle unauthorized errors cleanly
  if (res.status === 401) {
    console.warn("❌ Unauthorized request:", endpoint);
  }

  const json = await res.json();
  return json;
}
