/* =========================================================
   Client de l'API : requêtes JSON + jeton de connexion
   ========================================================= */
const api = (() => {
  const TOKEN_KEY = 'rm-token';
  const SLOW_MS = 2500; // l'hébergement gratuit met l'API en veille : le premier appel peut être lent

  const token = {
    get() { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
    set(value) { try { sessionStorage.setItem(TOKEN_KEY, value); } catch { /* navigation privée */ } },
    clear() { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
  };

  async function request(method, path, body, { quiet = false } = {}) {
    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const jwt = token.get();
    if (jwt) headers.Authorization = `Bearer ${jwt}`;

    const slow = quiet ? null : setTimeout(() => api.onSlow(), SLOW_MS);
    let res;
    try {
      res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch {
      const error = new Error('Le serveur ne répond pas. Réessayez dans un instant.');
      error.status = 0;
      throw error;
    } finally {
      clearTimeout(slow);
    }
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || 'Une erreur est survenue.');
      error.status = res.status;
      error.details = data.details;
      if (res.status === 401 && jwt) api.onUnauthorized();
      throw error;
    }
    return data;
  }

  return {
    enabled: Boolean(API_URL),
    token,
    onSlow() {},
    onUnauthorized() {},
    get: (path, options) => request('GET', path, undefined, options),
    post: (path, body) => request('POST', path, body),
    del: (path) => request('DELETE', path),
  };
})();
