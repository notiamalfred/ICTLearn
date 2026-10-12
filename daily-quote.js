const quoteElement = document.getElementById("daily-quote");

function renderQuote(text, author) {
  if (!quoteElement) return;
  quoteElement.innerHTML = "";

  const textEl = document.createElement("p");
  textEl.className = "daily-quote-text";
  textEl.textContent = `"${text}"`;

  const authorEl = document.createElement("footer");
  authorEl.className = "daily-quote-author";
  authorEl.textContent = `— ${author}`;

  quoteElement.appendChild(textEl);
  quoteElement.appendChild(authorEl);
}

const now = new Date();
const start = new Date(now.getFullYear(), 0, 0);
const dayOfYear = Math.floor((now - start) / 86400000);
const q = quotes[dayOfYear % quotes.length];
renderQuote(q.text, q.author);
