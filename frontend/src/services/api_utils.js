const API_URL = import.meta.env.VITE_API_URL;

function isTokenExpired(token) {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    const now = Date.now() / 1000;
    // Add 30 second buffer to refresh before actual expiration
    return decoded.exp - 30 < now;
  } catch {
    return true;
  }
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  
  localStorage.setItem("access", data.access);
  
  // Handle refresh token rotation
  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }
  
  return data.access;
}

export async function authenticatedFetch(url, options = {}) {
  let token = localStorage.getItem("access");

  // Check if token is expired and refresh if needed
  if (token && isTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  // Make the request with the token
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // If we get a 401, try refreshing the token once
  if (response.status === 401) {
    try {
      token = await refreshAccessToken();
      // Retry the request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Token refresh failed on 401:", error);
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/";
      throw new Error("Session expired");
    }
  }

  return response;
}

export { isTokenExpired, refreshAccessToken };
