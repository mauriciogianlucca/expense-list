/* ============================================================
   storage.js  -  remembering the list between visits
   ------------------------------------------------------------
   The only file that talks to localStorage. If this app ever
   moved to a real server, this is the single file that would be
   rewritten. Nothing else knows where the data lives.

   Every call is wrapped in try/catch because localStorage is not
   guaranteed. In a private window, with site data blocked, or
   when the quota is full, it throws. An app that crashes in a
   private window is a broken app, so a failed read returns an
   empty list and a failed write returns false.
   ============================================================ */

const ExpenseStorage = (function () {

  // The version suffix means a future change to the record shape
  // can use a new key instead of choking on old data.
  const KEY = "expense-list.v1";

  /**
   * Read the saved list.
   * Always returns an array, even when storage is unavailable or
   * the stored text is damaged.
   */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      // Anything that does not look like an expense is dropped
      // rather than allowed to break the rest of the app.
      return parsed.filter(isValidRecord);

    } catch (error) {
      return [];
    }
  }

  /**
   * Save the list. Returns true if it was written, false if the
   * browser refused.
   */
  function save(expenses) {
    try {
      localStorage.setItem(KEY, JSON.stringify(expenses));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Forget everything this app has stored.
   */
  function clear() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * A stored record is only usable if it has an id, a text name
   * and a whole number of cents.
   */
  function isValidRecord(record) {
    return record !== null
      && typeof record === "object"
      && record.id !== undefined
      && typeof record.name === "string"
      && Number.isFinite(Number(record.amountCents));
  }

  return {
    load: load,
    save: save,
    clear: clear,
    KEY: KEY
  };

})();
