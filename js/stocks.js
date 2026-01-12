// const input = document.getElementById("stocks-search");
// const btn = document.getElementById("stocks-search-btn");

// const body = document.getElementById("stocks-results-body");
// const countEl = document.getElementById("stocks-results-count");
// const hintEl = document.getElementById("stocks-results-hint");

// мок-данные
const MOCK = [
  { ticker: "SBER", shortname: "Сбербанк", isin: "RU0009029540"},
  { ticker: "GAZP", shortname: "Газпром", isin: "RU0007661625"},
  { ticker: "LKOH", shortname: "Лукойл", isin: "RU0009024277"},
];

// function render(rows) {
//   body.innerHTML = "";

//   if (!rows.length) {
//     body.innerHTML = `<div class="results__row muted" style="grid-template-columns: 1fr;">
//       Ничего не найдено
//     </div>`;
//     countEl.textContent = `Найдено: 0`;
//     hintEl.textContent = "Попробуйте другой запрос";
//     return;
//   }

//   const html = rows.map(x => `
//     <div class="results__row">
//       <div><span class="badge">${x.ticker}</span></div>
//       <div>${x.name}</div>
//       <div class="muted">${x.isin ?? ""}</div>
//       <div class="right muted">${x.exchange ?? ""}</div>
//     </div>
//   `).join("");

//   body.innerHTML = html;
//   countEl.textContent = `Найдено: ${rows.length}`;
//   hintEl.textContent = "";
// }

// function doSearch() {
//   const q = (input.value || "").trim().toLowerCase();
//   if (!q) {
//     render([]);
//     hintEl.textContent = "Введите запрос";
//     return;
//   }

//   const filtered = MOCK.filter(x =>
//     (x.ticker || "").toLowerCase().includes(q) ||
//     (x.name || "").toLowerCase().includes(q) ||
//     (x.isin || "").toLowerCase().includes(q)
//   );

//   render(filtered);
// }

// btn.addEventListener("click", doSearch);
// input.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") doSearch();
// });

// // стартовое состояние
// render([]);
