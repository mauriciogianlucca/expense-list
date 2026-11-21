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

/* ============================================================
   ui.js  -  the screen
   ------------------------------------------------------------
   The only file that touches the DOM. It reads what the user
   typed, asks domain.js whether it is valid, asks storage.js to
   remember the result, and redraws.

   It contains no rules of its own. If you want to know what
   counts as a valid amount, the answer is in domain.js, not
   here.
   ============================================================ */

(function () {
  "use strict";

  // ---- the elements we work with -------------------------------
  const form        = document.getElementById("expense-form");
  const nameInput   = document.getElementById("expense-name");
  const amountInput = document.getElementById("expense-amount");
  const errorBox    = document.getElementById("form-error");
  const listBox     = document.getElementById("expense-list");
  const emptyBox    = document.getElementById("empty-state");
  const totalBox    = document.getElementById("total-value");
  const countBox    = document.getElementById("total-count");

  // ---- the one piece of state ----------------------------------
  // Loaded once at startup, kept in memory while the page is
  // open, and written back to storage after every change.
  let expenses = ExpenseStorage.load();

  // ---- drawing -------------------------------------------------

  function render() {
    // Empty the list and rebuild it. The list is small, so the
    // simplest correct approach is the right one.
    listBox.textContent = "";

    expenses.forEach(function (expense) {
      listBox.appendChild(buildRow(expense));
    });

    emptyBox.hidden = expenses.length > 0;

    totalBox.textContent = ExpenseDomain.formatMoney(
      ExpenseDomain.totalCents(expenses)
    );

    countBox.textContent = describeCount(expenses.length);
  }

  function buildRow(expense) {
    const row = document.createElement("li");
    row.className = "list__item";

    const name = document.createElement("span");
    name.className = "list__name";
    // textContent, never innerHTML. The name came from the user,
    // and innerHTML would run any HTML or script inside it.
    name.textContent = expense.name;

    const amount = document.createElement("span");
    amount.className = "list__amount";
    amount.textContent = ExpenseDomain.formatMoney(expense.amountCents);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn--delete";
    remove.textContent = "Delete";
    // A screen reader hears "Delete Coffee" instead of fifteen
    // buttons that all say "Delete".
    remove.setAttribute("aria-label", "Delete " + expense.name);
    remove.addEventListener("click", function () {
      deleteExpense(expense.id);
    });

    row.appendChild(name);
    row.appendChild(amount);
    row.appendChild(remove);
    return row;
  }

  function describeCount(count) {
    if (count === 0) return "No expenses yet";
    if (count === 1) return "1 expense";
    return count + " expenses";
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  }

  // ---- the three things the user can do -------------------------

  function addExpense(nameValue, amountValue) {
    const result = ExpenseDomain.createExpense(nameValue, amountValue, expenses);

    // The domain never throws. It returns ok: false instead, so
    // a rejection is handled here in the same shape as a success.
    if (!result.ok) {
      showError(result.message);
      return;
    }

    expenses = expenses.concat([result.expense]);
    persist();
    showError("");
    render();

    form.reset();
    nameInput.focus();
  }

  function deleteExpense(id) {
    expenses = ExpenseDomain.removeById(expenses, id);
    persist();
    render();
  }

  function persist() {
    const saved = ExpenseStorage.save(expenses);
    if (!saved) {
      showError("This browser would not save the list, so it will "
              + "be lost when the page closes.");
    }
  }

  // ---- wiring ---------------------------------------------------

  form.addEventListener("submit", function (event) {
    // The form has no server to post to, so the default page
    // reload has to be stopped.
    event.preventDefault();
    addExpense(nameInput.value, amountInput.value);
  });

  // Clear a stale error as soon as the user starts fixing it.
  [nameInput, amountInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (errorBox.textContent) {
        showError("");
      }
    });
  });

  // ---- start ----------------------------------------------------

  showError("");
  render();

})();
