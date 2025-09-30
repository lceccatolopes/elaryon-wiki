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

// Renderizar cards
function render(list) {
  content.innerHTML = "";
  list.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h2>${item.nome}</h2>
      <p><strong>${item.tipo}</strong></p>
      <p>${item.resumo}</p>
    `;
    content.appendChild(card);
  });
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

  // Salvar no localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  addForm.reset();
  render(data);
});
