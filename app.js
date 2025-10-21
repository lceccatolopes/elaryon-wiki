const STORAGE_KEY = "elarion-data";

// Dados iniciais
const defaultData = [
  { tipo: "Reino", nome: "Arcan", resumo: "Antigo vilarejo que cresceu até tornar-se reino.", continente: "Varyon", _ts: Date.now()-4 },
  { tipo: "Clã", nome: "Arcanyth", resumo: "Família marcada por poder mágico ancestral.", origem: "Mytheras", _ts: Date.now()-3 },
  { tipo: "Personagem", nome: "Theodore Wolff", resumo: "Primeiro General de Arcan, criado por lobos.", reinoRef: "Arcan", claRef: "Arcanyth", _ts: Date.now()-2 },
  { tipo: "Poder", nome: "Olhos da Fúria", resumo: "Amplifica atributos de combate em explosões controladas.", categoria: "visual", ranking: "ancestral", _ts: Date.now()-1 },
  { tipo: "Evento", nome: "Guerra de Varyon", resumo: "Conflito histórico nas fronteiras sombrias.", data: "1023-05-12", local: "Arcan", _ts: Date.now() }
];

// Carregar do localStorage ou usar padrão
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;
// Normaliza: garante timestamp
data = data.map((it, i) => ({ _ts: it._ts ?? (Date.now() - (data.length - i)), ...it }));

// Estado de UI
let currentFilter = "all"; // all | Reino | Clã | Personagem | Poder | Evento
let currentSort = "az";    // az | za | recent
let editingIndex = null;

// DOM
const content = document.getElementById("content");
const searchInput = document.getElementById("search");
const addForm = document.getElementById("add-form");
const tipoSelect = document.getElementById("tipo");
const sortSelect = document.getElementById("sort");

// Campos adicionais (add)
const addReinoContinente = document.getElementById("add-reino-continente");
const addClaOrigem = document.getElementById("add-cla-origem");
const addPersReino = document.getElementById("add-personagem-reino");
const addPersCla = document.getElementById("add-personagem-cla");
const addPoderCategoria = document.getElementById("add-poder-categoria");
const addPoderRanking = document.getElementById("add-poder-ranking");
const addEventoData = document.getElementById("add-evento-data");
const addEventoLocal = document.getElementById("add-evento-local");

// Modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const editForm = document.getElementById("edit-form");
const editNome = document.getElementById("edit-nome");
const editTipo = document.getElementById("edit-tipo");
const editResumo = document.getElementById("edit-resumo");

// Campos adicionais (edit)
const editReinoContinente = document.getElementById("edit-reino-continente");
const editClaOrigem = document.getElementById("edit-cla-origem");
const editPersReino = document.getElementById("edit-personagem-reino");
const editPersCla = document.getElementById("edit-personagem-cla");
const editPoderCategoria = document.getElementById("edit-poder-categoria");
const editPoderRanking = document.getElementById("edit-poder-ranking");
const editEventoData = document.getElementById("edit-evento-data");
const editEventoLocal = document.getElementById("edit-evento-local");

// Import/Export
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");

// ===== Helpers =====
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function byTypeShow(containerSelector, tipo) {
  document.querySelectorAll(containerSelector).forEach(div => {
    if (div.dataset.for === tipo) div.classList.add("show");
    else div.classList.remove("show");
  });
}

function getFilteredAndSearched() {
  const q = (searchInput.value || "").toLowerCase().trim();
  let list = data
    .filter(item => currentFilter === "all" ? true : (item.tipo||"").toLowerCase() === currentFilter.toLowerCase())
    .filter(item =>
      !q ||
      (item.nome||"").toLowerCase().includes(q) ||
      (item.tipo||"").toLowerCase().includes(q) ||
      (item.resumo||"").toLowerCase().includes(q) ||
      (item.continente||"").toLowerCase().includes(q) ||
      (item.origem||"").toLowerCase().includes(q) ||
      (item.reinoRef||"").toLowerCase().includes(q) ||
      (item.claRef||"").toLowerCase().includes(q) ||
      (item.categoria||"").toLowerCase().includes(q) ||
      (item.ranking||"").toLowerCase().includes(q) ||
      (item.data||"").toLowerCase().includes(q) ||
      (item.local||"").toLowerCase().includes(q)
    );

  // Ordenação
  if (currentSort === "az") list.sort((a,b)=> (a.nome||"").localeCompare(b.nome||""));
  if (currentSort === "za") list.sort((a,b)=> (b.nome||"").localeCompare(a.nome||""));
  if (currentSort === "recent") list.sort((a,b)=> (b._ts||0) - (a._ts||0));

  return list;
}

// ===== Render =====
function render(list = getFilteredAndSearched()) {
  content.innerHTML = "";
  list.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    // Metas por tipo
    let extra = "";
    if (item.tipo === "Reino" && item.continente) extra += `<div class="meta">🌍 Continente: ${item.continente}</div>`;
    if (item.tipo === "Clã" && item.origem) extra += `<div class="meta">🏷️ Origem: ${item.origem}</div>`;
    if (item.tipo === "Personagem") {
      if (item.reinoRef) extra += `<div class="meta">🏰 Reino: ${item.reinoRef}</div>`;
      if (item.claRef) extra += `<div class="meta">🐺 Clã: ${item.claRef}</div>`;
    }
    if (item.tipo === "Poder") {
      if (item.categoria) extra += `<div class="meta">✨ Categoria: ${item.categoria}</div>`;
      if (item.ranking)   extra += `<div class="meta">🛡️ Ranking: ${item.ranking}</div>`;
    }
    if (item.tipo === "Evento") {
      if (item.data)  extra += `<div class="meta">📅 Data: ${item.data}</div>`;
      if (item.local) extra += `<div class="meta">📍 Local: ${item.local}</div>`;
    }

    card.innerHTML = `
      <button class="delete-btn">Excluir</button>
      <h2>${item.nome || ""}</h2>
      <p><strong>${item.tipo || ""}</strong></p>
      <p>${item.resumo || ""}</p>
      ${extra}
    `;

    // Clicar no card abre modal (exceto excluir)
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        const realIndex = data.findIndex(d => d._ts === item._ts);
        openModal(realIndex);
      }
    });

    // Excluir
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const realIndex = data.findIndex(d => d._ts === item._ts);
      if (realIndex >= 0) {
        data.splice(realIndex, 1);
        saveData();
        render();
      }
    });

    content.appendChild(card);
  });
}

// ===== Modal =====
function openModal(index) {
  editingIndex = index;
  const it = data[editingIndex];

  editNome.value = it.nome || "";
  editTipo.value = it.tipo || "Reino";
  editResumo.value = it.resumo || "";

  byTypeShow(".bytype-edit", editTipo.value);

  // Preenche extras
  editReinoContinente.value = it.continente || "";
  editClaOrigem.value = it.origem || "";
  editPersReino.value = it.reinoRef || "";
  editPersCla.value = it.claRef || "";
  editPoderCategoria.value = it.categoria || "";
  editPoderRanking.value = it.ranking || "";
  editEventoData.value = it.data || "";
  editEventoLocal.value = it.local || "";

  modal.style.display = "flex";
}

document.getElementById("close-modal").addEventListener("click", () => {
  modal.style.display = "none";
});

// Troca de tipo no modal
editTipo.addEventListener("change", () => {
  byTypeShow(".bytype-edit", editTipo.value);
});

// Editar item
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex !== null && editingIndex >= 0) {
    const base = {
      _ts: data[editingIndex]._ts || Date.now(),
      nome: editNome.value.trim(),
      tipo: editTipo.value,
      resumo: editResumo.value.trim()
    };

    // Limpa extras
    ["continente","origem","reinoRef","claRef","categoria","ranking","data","local"].forEach(k=> delete base[k]);

    if (editTipo.value === "Reino") base.continente = editReinoContinente.value.trim();
    if (editTipo.value === "Clã") base.origem = editClaOrigem.value.trim();
    if (editTipo.value === "Personagem") {
      base.reinoRef = editPersReino.value.trim();
      base.claRef = editPersCla.value.trim();
    }
    if (editTipo.value === "Poder") {
      base.categoria = editPoderCategoria.value.trim();
      base.ranking   = editPoderRanking.value.trim();
    }
    if (editTipo.value === "Evento") {
      base.data = editEventoData.value.trim();
      base.local = editEventoLocal.value.trim();
    }

    data[editingIndex] = base;
    saveData();
    render();
    modal.style.display = "none";
  }
});

// ===== Busca =====
searchInput.addEventListener("input", () => render());

// ===== Filtros =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter; // all, Reino, Clã, Personagem, Poder, Evento
    render();
  });
});
document.querySelector('.filter-btn[data-filter="all"]').classList.add("active");

// ===== Ordenação =====
sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value; // az | za | recent
  render();
});

// ===== Mostrar campos por tipo (form add) =====
tipoSelect.addEventListener("change", () => {
  byTypeShow(".bytype", tipoSelect.value);
});

// ===== Adicionar novo item =====
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const tipo = tipoSelect.value;
  const resumo = document.getElementById("resumo").value.trim();
  if (!nome || !tipo) return;

  const base = { _ts: Date.now(), nome, tipo, resumo };

  if (tipo === "Reino") base.continente = (addReinoContinente.value || "").trim();
  if (tipo === "Clã") base.origem = (addClaOrigem.value || "").trim();
  if (tipo === "Personagem") {
    base.reinoRef = (addPersReino.value || "").trim();
    base.claRef = (addPersCla.value || "").trim();
  }
  if (tipo === "Poder") {
    base.categoria = (addPoderCategoria.value || "").trim();
    base.ranking   = (addPoderRanking.value || "").trim();
  }
  if (tipo === "Evento") {
    base.data = (addEventoData.value || "").trim();
    base.local = (addEventoLocal.value || "").trim();
  }

  data.push(base);
  saveData();

  addForm.reset();
  byTypeShow(".bytype", ""); // esconde extras
  render();
});

// ===== Exportar =====
document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "elarion-data.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// ===== Importar =====
document.getElementById("import-input").addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (Array.isArray(imported)) {
      const merged = [...data, ...imported.map(it => ({ _ts: it._ts || Date.now(), ...it }))];
      const seen = new Set();
      data = merged.filter(item => {
        const key = `${(item.nome||"").trim()}|${(item.tipo||"").trim()}|${(item.resumo||"").trim()}|${(item._ts||0)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return item && item.nome && item.tipo;
      });
      saveData();
      render();
      e.target.value = "";
      alert("Dados importados com sucesso!");
    } else {
      alert("Arquivo inválido. Deve ser um array JSON.");
    }
  } catch {
    alert("Erro ao importar JSON.");
  }
});

// ===== Inicial =====
render();
