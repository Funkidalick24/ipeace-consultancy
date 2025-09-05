// API configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000' // Development server
  : 'https://your-production-api.com'; // Replace with your production API URL

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
}