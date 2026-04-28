const api = {
  get: (url) =>
    fetch(url).then(r => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    }),

  post: (url, body) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    }),

  patch: (url, body) =>
    fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => r.json()),

  delete: (url) =>
    fetch(url, { method: 'DELETE' }),
};

export default api;