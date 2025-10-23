
// ===== Логика UI =====
function normalize(s){ return (s||'').toString().trim(); }
function lower(s){ return normalize(s).toLowerCase(); }

//список активов
let ASSETS = [];

const input = document.getElementById('q');
const dd = document.getElementById('dd');

let active = -1; // индекс подсвеченного элемента
let lastItems = [];
let debounceId = null;
let selectedTicker = "";

// Подсветка совпадений
function highlight(text, q)
{
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return text.substring(0, idx) + '<mark class="em">' + text.substring(idx, idx+q.length) + '</mark>' + text.substring(idx+q.length);
}

// Ядро: поиск
function searchLocal(q, limit=20)
{
    const s = lower(q);
    if (!s) return [];
    const sDigits = s.replace(/\D/g,'');

    const tick = [];
    const isin = [];
    const name = [];

    for (const a of ASSETS)
    {
        // Тикер — префикс
        if (a.t_l.startsWith(s)) 
        { 
            tick.push(a); 
            continue; 
        }

        // ISIN — префикс/подстрока/по цифрам
        if (a.i_l.startsWith(s) || (s.length >= 2 && a.i_l.includes(s)) || (sDigits.length >= 2 && a.i_l.replace(/\D/g,'').includes(sDigits))) 
        { 
            isin.push(a); 
            continue; 
        }

        // Название — подстрока
        if (a.n_l.includes(s)) 
        { 
            name.push(a); 
        }

        if (tick.length + isin.length + name.length > 60) break;
    }

    const merged = [...tick, ...isin, ...name];
    const out = []; 
    const seen = new Set();

    for (const a of merged)
    {
        if (!seen.has(a.t)) 
        { 
            seen.add(a.t); 
            out.push(a); 
            if (out.length>=limit) break; 
        }
    }

    return out;
}

// Рендер выпадающего списка
function renderDropdown(items, q)
{
    lastItems = items; 
    active = items.length ? 0 : -1;

    if (!q || items.length === 0)
    { 
        dd.hidden = true; 
        dd.innerHTML = ''; 
        return; 
    }

    const ql = q.toLowerCase();

    dd.innerHTML =`
    <p class="hint-muted">
            Навигация: <span class="kbd">↑</span>/<span class="kbd">↓</span>, выбор — <span class="kbd">Enter</span>, закрыть — <span class="kbd">Esc</span>
          </p>`;


    dd.innerHTML += items.map((a, idx)=>`
        <div class="option ${idx===active?'active':''}" data-idx="${idx}">
        <div class="name">${highlight(a.n, q)}</div>
        <div class="ticker">${highlight(a.t, q)}</div>
        </div>`).join('');
    dd.hidden = false;
}

// Выбор элемента
function selectItem(idx)
{
    const a = lastItems[idx]; 
    if (!a) return;
    dd.hidden = true; input.blur();
    selectedTicker = a.t;
    q.value = `${a.n} (${a.t})` ;
}

// Обработка ввода
function handleInput()
{
    const q = input.value.trim();

    if (!q)
    { 
        dd.hidden = true; 
        result.classList.add('muted'); 
        result.textContent = 'Ничего не выбрано'; 
        return; 
    }

    const items = searchLocal(q, 5);
    renderDropdown(items, q);
}

// Дебаунс
input.addEventListener('input', () => 
{ 
    clearTimeout(debounceId); debounceId = setTimeout(handleInput, 180); 
});

// Клавиатура: стрелки/Enter/Esc
input.addEventListener('keydown', (e)=>
{
    if (dd.hidden) return;

    if (e.key === 'ArrowDown')
    { 
        e.preventDefault(); 
        active = Math.min(active+1, lastItems.length-1); 
        updateActive(); 
    }
    else if (e.key === 'ArrowUp')
    { 
        e.preventDefault(); 
        active = Math.max(active-1, 0); 
        updateActive(); 
    }
    else if (e.key === 'Enter')
    { 
        e.preventDefault(); 
        selectItem(active); 
    }
    else if (e.key === 'Escape')
    { 
        dd.hidden = true; 
    }
});

function updateActive()
{ 
    Array.from(dd.children).forEach((el,i)=>
    { 
        if (i===(active+1)) el.classList.add('active'); 
        else el.classList.remove('active'); 
    }); 
}

// Мышь
dd.addEventListener('mousedown', (e)=>
{ 
    const el = e.target.closest('.option'); 
    if (!el) return; 
    selectItem(+el.dataset.idx); 
});

// Клики вне
window.addEventListener('click', (e)=>
{ 
    if (!dd.contains(e.target) && e.target!==input)
    { 
        dd.hidden = true; 
    } 
});

input.focus();

//Кнопка поиска
const btn = document.getElementById('go');
btn.addEventListener('click', fetchData);


//--------------------
const result = document.getElementById('result');

function clearResult(){
  result.hidden = true;
  result.innerHTML = "";
}

function renderKV(k, v){
  const row = document.createElement("div");
  row.className = "kv";

  const dk = document.createElement("div");
  dk.className = "k";
  dk.textContent = k;

  const dv = document.createElement("div");
  dv.className = "v";
  dv.textContent = v ?? "—";

  row.appendChild(dk);
  row.appendChild(dv);
  return row;
}

function renderStock(stock){
  clearResult();
  const frag = document.createDocumentFragment();
  frag.appendChild(renderKV("Тикер", stock.ticker));
  frag.appendChild(renderKV("Название", stock.name));
  frag.appendChild(renderKV("ISIN", stock.isin));
  frag.appendChild(renderKV("Текущая цена", formatMoney(stock.lastPrice)));
  frag.appendChild(renderKV("Акций в обращении", formatNumber(stock.sharesOutstanding)));
  frag.appendChild(renderKV("Капитализация", formatMoney(stock.marketCapitalization)));
  result.appendChild(frag);
  result.hidden = false;
}

function formatNumber(x){
  return x == null ? "—" : new Intl.NumberFormat("ru-RU").format(x);
}
function formatMoney(x){
  return x == null ? "—" : new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", maximumFractionDigits: 2
  }).format(x);
}

//--------------------

// Запросы серверу:
const API_URL = "https://api.fineva.ru/";

fetchSecuritiesList();

//Выгрузить список активов
async function fetchSecuritiesList(){
  try{
    const res = await fetch(API_URL + encodeURIComponent("getsecurities"), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!data || !data.securitiesList) throw new Error("Bad payload");

    ASSETS.push(
      ...data.securitiesList.map(x => ({
        t: normalize(x.ticker),
        n: normalize(x.shortName),
        i: normalize(x.isin),
        t_l: lower(x.ticker),
        n_l: lower(x.shortName),
        i_l: lower(x.isin)
      }))
    );

  } catch (e){
   
  } finally {
 
  }
};

//Выгрузить данные по тикеру
async function fetchData(){
  const t = (selectedTicker || "").trim().toUpperCase();
  if (!t){
    //setError("Введите тикер");
    //clearResult();ы
    return;
  }

  //setLoading(true);
  //setError(""); // очистим статус

  try{
    const res = await fetch(API_URL + "getstockdata/" + encodeURIComponent(t), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!data || !data.stock) throw new Error("Bad payload");

    renderStock(data.stock);
    //status.textContent = ""; // убираем статус при успешной загрузке
    //status.className = "status";
  } catch (e){
    // Сохраняю твой особый случай для SBER
   // if (t === "SBER"){
    //  setError("Нет связи с сервером!");
   // } else {
    //  setError("Ошибка: " + (e?.message || e));
   // }
    //clearResult();
  } finally {
    //setLoading(false);
  }
};


