const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const postFormData = async (endpoint, formData) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to fetch from API");
  return res.json();
};

export const postJSON = async (endpoint, jsonBody, format) => {
  const res = await fetch(`${BASE_URL}${endpoint}?format=${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonBody),
  });
  if (!res.ok) throw new Error("Export failed");
  return res;
};
