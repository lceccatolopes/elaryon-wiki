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

let editingIndex = null;

// Renderizar cards
function render(list) {
  content.innerHTML = "";
  list.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <button class="delete-btn" data-index="${index}">Excluir</button>
      <h2>${item.nome}</h2>
      <p><strong>${item.tipo}</strong></p>
      <p>${item.resumo}</p>
    `;
    // Clicar no card abre modal (mas não no botão excluir)
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
      const index = btn.dataset.index;
      data.splice(index, 1);
      saveData();
      render(data);
    });
  });
}

// Abrir modal
function openModal(index) {
  editingIndex = index;
  const item = data[index];
  editNome.value = item.nome;
  editTipo.value = item.tipo;
  editResumo.value = item.resumo;
  modal.style.display = "flex";
}

// Fechar modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Editar item
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex !== null) {
    data[editingIndex] = {
      nome: editNome.value,
      tipo: editTipo.value,
      resumo: editResumo.value
    };
    saveData();
    render(data);
    modal.style.display = "none";
  }
});

// Salvar no localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Inicial
render(data);

// Busca
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = data.filter(item => 
    item.nome.toLowerCase().includes(q) ||
    item.tipo.toLowerCase().includes(q) ||
    item.resumo.toLowerCase().includes(q)
  );
  render(filtered);
});

// Adicionar novo item
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const tipo = document.getElementById("tipo").value;
  const resumo = document.getElementById("resumo").value;

  const novoItem = { nome, tipo, resumo };
  data.push(novoItem);

  saveData();
  addForm.reset();
  render(data);
});
