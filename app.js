const STORAGE_KEY = "elarion-data";

// Dados iniciais
const defaultData = [
  { tipo: "Reino", nome: "Arcan", resumo: "Antigo vilarejo que cresceu até tornar-se reino." },
  { tipo: "Clã", nome: "Arcanyth", resumo: "Família marcada por poder mágico ancestral." },
  { tipo: "Personagem", nome: "Theodore Wolff", resumo: "Primeiro General de Arcan, criado por lobos." },
  { tipo: "Evento", nome: "Guerra de Varyon", resumo: "Conflito histórico nas fronteiras sombrias." }
];

// Carregar do localStorage ou usar padrão
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

// Estado de UI
let currentFilter = "all"; // all | Reino | Clã | Personagem | Evento
let editingIndex = null;

const content = document.getElementById("content");
const searchInput = document.getElementById("search");
const addForm = document.getElementById("add-form");

// Modal
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const editForm = document.getElementById("edit-form");
const editNome = document.getElementById("edit-nome");
const editTipo = document.getElementById("edit-tipo");
const editResumo = document.getElementById("edit-resumo");

// Import/Export
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");

// ===== Helpers =====
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getFilteredAndSearched() {
  const q = (searchInput.value || "").toLowerCase().trim();
  return data
    .filter(item => currentFilter === "all" ? true : item.tipo.toLowerCase() === currentFilter.toLowerCase())
    .filter(item =>
      !q ||
      item.nome.toLowerCase().includes(q) ||
      item.tipo.toLowerCase().includes(q) ||
      (item.resumo || "").toLowerCase().includes(q)
    );
}

// ===== Render =====
function render(list = getFilteredAndSearched()) {
  content.innerHTML = "";
  list.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <button class="delete-btn" data-index="${index}">Excluir</button>
      <h2>${item.nome}</h2>
      <p><strong>${item.tipo}</strong></p>
      <p>${item.resumo || ""}</p>
    `;
    // Clicar no card abre modal (exceto botão excluir)
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("delete-btn")) {
        openModal(index);
      }
    });
    content.appendChild(card);
  });

  // Botões excluir
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // impedir abrir modal
      const index = Number(btn.dataset.index);
      data.splice(index, 1);
      saveData();
      render();
    });
  });
}

// ===== Modal =====
function openModal(index) {
  editingIndex = index;
  const item = getFilteredAndSearched()[index];

  // Precisamos mapear para o índice real no data ao usar filtros:
  const visible = getFilteredAndSearched();
  const visibleItem = visible[index];
  const realIndex = data.findIndex(d =>
    d.nome === visibleItem.nome &&
    d.tipo === visibleItem.tipo &&
    (d.resumo || "") === (visibleItem.resumo || "")
  );
  editingIndex = realIndex;

  editNome.value = data[editingIndex].nome || "";
  editTipo.value = data[editingIndex].tipo || "";
  editResumo.value = data[editingIndex].resumo || "";
  modal.style.display = "flex";
}

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Editar item
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex !== null && editingIndex >= 0) {
    data[editingIndex] = {
      nome: editNome.value,
      tipo: editTipo.value,
      resumo: editResumo.value
    };
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
    currentFilter = btn.dataset.filter; // all, Reino, Clã, Personagem, Evento
    render();
  });
});
// Deixa “Tudo” ativo no início
document.querySelector('.filter-btn[data-filter="all"]').classList.add("active");

// ===== Adicionar novo item =====
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const resumo = document.getElementById("resumo").value.trim();

  if (!nome || !tipo) return;

  data.push({ nome, tipo, resumo });
  saveData();
  addForm.reset();
  render();
});

// ===== Exportar =====
exportBtn.addEventListener("click", () => {
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
importInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (Array.isArray(imported)) {
      // Mescla e remove duplicados simples por (nome+tipo+resumo)
      const merged = [...data, ...imported];
      const seen = new Set();
      data = merged.filter(item => {
        const key = `${(item.nome||"").trim()}|${(item.tipo||"").trim()}|${(item.resumo||"").trim()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return item && item.nome && item.tipo;
      });
      saveData();
      render();
      importInput.value = ""; // reset
      alert("Dados importados com sucesso!");
    } else {
      alert("Arquivo inválido. Deve ser um array JSON.");
    }
  } catch (err) {
    alert("Erro ao importar JSON.");
  }
});

// ===== Inicial =====
render();
