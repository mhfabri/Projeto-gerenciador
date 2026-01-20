// =========================
// CONFIGURAÇÃO SUPABASE
// =========================
const SUPABASE_URL = "https://ieompjvhqvuotlbcacro.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb21wanZocXZ1b3RsYmNhY3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMTMzODQsImV4cCI6MjA3OTU4OTM4NH0.HYStb4KheezhuicaDb_64iNrYeYD8jasM2fKhDIwaHs";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =========================
// PROTEÇÃO DE LOGIN
// =========================
async function verificarAcesso() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        window.location.href = "login.html";
    }
}

verificarAcesso();

// =========================
// VARIÁVEIS GLOBAIS
// =========================
let clientes = [];
let estoque = [];

// =========================
// CLIENTES
// =========================

async function carregarClientes() {
    const { data, error } = await supabaseClient
        .from("clientes")
        .select("*")
        .order("nome");

    if (error) return console.error(error);

    clientes = data;
    exibirClientes();
}

async function novoCliente() {
    let nome = prompt("Nome do cliente:");
    if (!nome) return;

    const { error } = await supabaseClient
        .from("clientes")
        .insert({ nome });

    if (error) return alert("Erro ao criar cliente!");

    carregarClientes();
}

// =========================
// PRODUTOS
// =========================

async function carregarEstoque() {
    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .order("nome");

    if (error) return console.error(error);

    estoque = data;
    exibirEstoque();
}

async function abastecerEstoque() {
    let nome = prompt("Nome do produto:");
    let preco = parseFloat(prompt("Preço:"));

    if (!nome || isNaN(preco)) return;

    const { error } = await supabaseClient
        .from("produtos")
        .insert({ nome, preco });

    if (error) return alert("Erro ao adicionar produto!");

    carregarEstoque();
}

// =========================
// GASTOS
// =========================

function toggleSelecaoProduto(idCliente) {
    document.querySelectorAll(".selecao-produto").forEach(e => e.remove());

    if (estoque.length === 0) {
        return alert("Nenhum produto cadastrado!");
    }

    const row = document.querySelector(`tr[data-id="${idCliente}"]`);

    const div = document.createElement("div");
    div.className = "selecao-produto";
    div.id = `sel-${idCliente}`;

    const select = document.createElement("select");
    select.id = `produto-${idCliente}`;

    estoque.forEach(prod => {
        const opt = document.createElement("option");
        opt.value = prod.id;
        opt.textContent = `${prod.nome} (R$ ${prod.preco.toFixed(2)})`;
        select.appendChild(opt);
    });

    const qtd = document.createElement("input");
    qtd.type = "number";
    qtd.value = 1;
    qtd.min = 1;
    qtd.id = `qtd-${idCliente}`;

    const btn = document.createElement("button");
    btn.textContent = "Confirmar";
    btn.onclick = () => confirmarGasto(idCliente);

    const cancel = document.createElement("button");
    cancel.textContent = "Cancelar";
    cancel.onclick = () => div.remove();

    div.appendChild(select);
    div.appendChild(qtd);
    div.appendChild(btn);
    div.appendChild(cancel);

    row.insertAdjacentElement("afterend", div);
}

async function confirmarGasto(idCliente) {
    let produtoId = document.getElementById(`produto-${idCliente}`).value;
    let quantidade = parseInt(document.getElementById(`qtd-${idCliente}`).value);

    let produto = estoque.find(p => p.id === produtoId);

    const valor = produto.preco * quantidade;

    const { error } = await supabaseClient
        .from("gastos")
        .insert({
            cliente_id: idCliente,
            produto_id: produtoId,
            quantidade,
            valor,
            data: new Date().toISOString().split("T")[0]
        });

    if (error) return alert("Erro ao registrar gasto!");

    carregarClientes();
}

// =========================
// PAGAMENTOS
// =========================

async function registrarPagamento(idCliente) {
    let valor = parseFloat(prompt("Valor pago:"));
    if (isNaN(valor) || valor <= 0) return;

    const { error } = await supabaseClient
        .from("pagamentos")
        .insert({
            cliente_id: idCliente,
            valor,
            data: new Date().toISOString().split("T")[0]
        });

    if (error) return alert("Erro ao registrar pagamento!");

    carregarClientes();
}

// =========================
// EXIBIR NA TELA
// =========================

function exibirClientes() {
    const tbody = document.getElementById("clientesTableBody");
    tbody.innerHTML = "";

    clientes.forEach(c => {
        tbody.innerHTML += `
            <tr class="cliente" data-id="${c.id}">
                <td>${c.nome}</td>
                <td>R$ ...</td>
                <td class="actions-cell">
                    <button onclick="event.stopPropagation(); toggleSelecaoProduto('${c.id}')">Adicionar Gasto</button>
                    <button onclick="event.stopPropagation(); registrarPagamento('${c.id}')">Registrar Pagamento</button>
                </td>
            </tr>
        `;
    });
}

function exibirEstoque() {
    const tbody = document.getElementById("estoqueTableBody");
    tbody.innerHTML = "";

    estoque.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>${p.nome}</td>
                <td>R$ ${p.preco.toFixed(2)}</td>
                <td><button onclick="excluirProduto('${p.id}')">Excluir</button></td>
            </tr>
        `;
    });
}

async function excluirProduto(id) {
    if (!confirm("Excluir produto?")) return;

    await supabaseClient.from("produtos").delete().eq("id", id);

    carregarEstoque();
}

// =========================
// LOGOUT
// =========================

async function logout() {
    await supabaseClient.auth.signOut();
    sessionStorage.removeItem("logado");
    window.location.href = "login.html";
}

// =========================
// INICIALIZAÇÃO
// =========================

carregarClientes();
