// charts.js
// Минимальный переиспользуемый SVG-график: оси + подписи min/max + линия
// Внешний вид управляется через charts.css (классы: axis, axis-text, line)

function renderLineChart(container, data) {
  // 0) базовые проверки
  if (!container) throw new Error("renderLineChart: container is required");
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error("renderLineChart: data must be an array with length >= 2");
  }

  // 1) берём размеры контейнера
  const rect = container.getBoundingClientRect();
  const width = Math.max(10, Math.floor(rect.width));
  const height = Math.max(10, Math.floor(rect.height));

  // 2) очистим контейнер (чтобы можно было перерисовывать)
  container.innerHTML = "";

  // 3) создаём SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  container.appendChild(svg);

  // 4) паддинги (чтобы было место под оси)
  const padL = 35, padR = 10, padT = 10, padB = 25;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  // 5) min/max по данным
  let min = Infinity, max = -Infinity;
  for (const v of data) {
    if (typeof v !== "number" || Number.isNaN(v)) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("renderLineChart: data must contain numeric values");
  }

  // защита от случая, когда все значения одинаковые
  if (min === max) {
    min -= 1;
    max += 1;
  }

  // 6) функции преобразования "значение -> координаты"
  // x: равномерно по точкам
  const xOf = (i) => padL + (i * plotW) / (data.length - 1);
  // y: чем больше значение, тем выше (но в SVG y растёт вниз)
  const yOf = (v) => padT + (1 - (v - min) / (max - min)) * plotH;

  // 7) оси
  svg.appendChild(makeLine(padL, padT + plotH, padL + plotW, padT + plotH, "axis")); // X
  svg.appendChild(makeLine(padL, padT, padL, padT + plotH, "axis"));                 // Y

  // 8) подписи шкалы по Y (max/min)
  svg.appendChild(makeText(padL - 6, padT + 10, String(max), "end", "axis-text"));
  svg.appendChild(makeText(padL - 6, padT + plotH, String(min), "end", "axis-text"));

  // 9) линия графика (path)
  let d = "";
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    // если вдруг попадётся нечисло — пропустим (можно улучшить позже)
    if (typeof v !== "number" || Number.isNaN(v)) continue;

    const x = xOf(i);
    const y = yOf(v);
    d += (d === "" ? "M" : "L") + x + " " + y + " ";
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d.trim());
  path.setAttribute("class", "line"); // стиль в CSS

  // страховка
path.setAttribute("fill", "none");
path.setAttribute("stroke", "black");
path.setAttribute("stroke-width", "2");

// ✅ сглаживание углов
path.setAttribute("stroke-linejoin", "round");
path.setAttribute("stroke-linecap", "round");


  svg.appendChild(path);

  // --- helpers ---
  function makeLine(x1, y1, x2, y2, className) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    if (className) el.setAttribute("class", className);
    return el;
  }

  function makeText(x, y, value, anchor, className) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("text-anchor", anchor || "start");
    if (className) el.setAttribute("class", className);
    el.textContent = value;
    return el;
  }
}
