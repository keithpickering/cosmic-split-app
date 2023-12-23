/**
 * Performs a fetch request with optional authorization and customizable request options.
 * Automatically sets 'Content-Type' to 'application/json' and stringifies the body for POST, PUT, and PATCH requests.
 * 
 * @param {string} url - The URL to fetch from.
 * @param {RequestInit & { token?: string, jsonBody?: object }} options - Fetch request options with an optional authorization token and optional JSON body.
 * @returns {Promise<any>} A promise that resolves with the fetched data.
 * @throws Will throw an error if the fetch request fails or if the response is not ok.
 */
export const fetchWithAuth = async (url: string, options: RequestInit & { token?: string, jsonBody?: any }): Promise<any> => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add the Authorization header if a token is provided
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  // Automatically set 'Content-Type' to 'application/json' and stringify the body for certain methods
  let body = options.body;
  if (options.jsonBody && ['POST', 'PUT', 'PATCH'].includes(options.method?.toUpperCase() || '')) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.jsonBody);
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: new Headers(headers),
    body,
  };

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

