# Expense List

A small web app for writing down what you spend and seeing the total.

Final individual project for CMPS 510, Principles and Concepts of Software
Engineering, Bay Atlantic University. Project 12 from the course catalogue.

**Live app:** https://YOUR-USERNAME.github.io/expense-list/

![Screenshot of the Expense List app](screenshot.png)

---

## What it does

The three must-have features from the project brief.

| Feature | How it works |
|---|---|
| Add an expense with a name and amount | Type a name and an amount, press Add. Invalid input is explained instead of accepted. |
| Show the total | The total updates on every add and delete. |
| Delete an expense, list saved in localStorage | Each row has a Delete button. The list survives a refresh, a closed tab and a restarted browser. |

---

## How to run it

Nothing to install and no build step.

- Open the live link above, or
- Download this repository and open `index.html` in any browser.

Your data stays in your own browser. Nothing is sent anywhere, because there
is no server to send it to.

---

## How the code is organised

Three JavaScript files, each with one job. A file never does the job of
another one, which is what makes it possible to answer "where is this
decided?" with a single file name.

| File | Job | What it must never do |
|---|---|---|
| `js/domain.js` | The rules. What is a valid amount, what the total is, what a new expense looks like. | Touch the screen or storage. |
| `js/storage.js` | Reading and writing localStorage. | Decide what is valid. |
| `js/ui.js` | Drawing the page and listening for clicks. | Contain any rule of its own. |

`index.html` loads them in that order, because `ui.js` uses the other two.

### Three decisions worth explaining

**Money is stored as whole cents, never as a decimal.** In JavaScript,
`0.1 + 0.2` is `0.30000000000000004`. A list of decimal amounts drifts away
from the real total as it grows. `1 + 2` cents is always `3` cents, so the
app stores `450` and only turns it into `$4.50` at the moment it is drawn.

**Invalid input is a return value, not a crash.** `createExpense` returns
either `{ ok: true, expense }` or `{ ok: false, code, message }`. It never
throws. The caller handles both outcomes with the same two lines, and every
error message lives in one place in `domain.js` so the message and the code
can never disagree.

**Every localStorage call is wrapped in try/catch.** localStorage throws in a
private window, when site data is blocked and when the quota is full. A
failed read returns an empty list and a failed write returns `false`, so the
app keeps working and tells the user their list will not be saved.

---

## Known limitations

Stated here rather than left for a reader to find.

- **One browser only.** The list lives in localStorage, so it does not follow
  you to another device or another browser. Sharing a list would need a
  server, and `js/storage.js` is the only file that would change.
- **No accounts.** Anyone using this browser profile sees the same list.
- **No categories or dates.** The brief listed the category total as optional
  and it is not built.
- **One currency.** Amounts are formatted as US dollars.

---

## Tools and AI assistants used

Declared as the project charter requires.

- **Claude (Anthropic)** was used to plan the file structure, write the
  initial version of the HTML, CSS and JavaScript, and explain the reasoning
  behind the three decisions listed above. I reviewed every file, tested the
  behaviour in the browser, and can explain how each part works.
- **MDN Web Docs** for the `localStorage` and `toLocaleString` references.
- **GitHub Pages** for hosting.

No frameworks or libraries. Plain HTML, CSS and JavaScript.

---

## Files

```
index.html        the page
styles.css        all styling
js/domain.js      rules: validation, totals, formatting
js/storage.js     localStorage read and write
js/ui.js          rendering and event handling
README.md         this file
screenshot.png    screenshot used above
```

---

Lucca Cabrera, November 2026.
