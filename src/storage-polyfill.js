// Provides window.storage backed by the browser's real localStorage,
// matching the shape Pocket's code already expects (get/set/delete/list,
// each returning { key, value, shared } | null). Import this once,
// before your app renders, and nothing else needs to change.

function prefixedKey(key, shared) {
  return (shared ? 'shared:' : 'personal:') + key;
}

window.storage = {
  async get(key, shared = false) {
    const raw = localStorage.getItem(prefixedKey(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    try {
      localStorage.setItem(prefixedKey(key, shared), value);
      return { key, value, shared };
    } catch (err) {
      return null; // e.g. storage full or disabled
    }
  },

  async delete(key, shared = false) {
    const existed = localStorage.getItem(prefixedKey(key, shared)) !== null;
    localStorage.removeItem(prefixedKey(key, shared));
    return existed ? { key, deleted: true, shared } : null;
  },

  async list(prefix = '', shared = false) {
    const tag = shared ? 'shared:' : 'personal:';
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const full = localStorage.key(i);
      if (full.startsWith(tag + prefix)) keys.push(full.slice(tag.length));
    }
    return { keys, prefix, shared };
  },
};
