
    // Verifica se o usuário fez login corretamente
    if (sessionStorage.getItem("logado") !== "true") {
        window.location.href = "login.html"; // Se não estiver logado, volta para a tela de login
    }

    // Código para login js
    const usuarios = {
            "admin": "1234", // Exemplo de usuário e senha
            "minhoca": "padoca0102",
            "du":"senha2"
            
            
            
        };

        function verificarLogin() {
            let user = document.getElementById("username").value;
            let pass = document.getElementById("password").value;

            if (usuarios[user] && usuarios[user] === pass) {
                sessionStorage.setItem("logado", "true"); // Salva o login temporário
                window.location.href = "index.html"; // Redireciona
            } else {
                alert("Usuario ou senha incorretos!");
            }
        }


    let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    let estoque = JSON.parse(localStorage.getItem('estoque')) || [];
    let clienteSelecionadoParaGasto = null; // Armazena o ID do cliente selecionado para adicionar gasto

    function salvarDados() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('estoque', JSON.stringify(estoque));
    }

    function gerarIdUnico() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function formatarDataParaExibicao(dataISO) {
        let [ano, mes, dia] = dataISO.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function formatarDataParaSalvar(dataBR) {
        let [dia, mes, ano] = dataBR.split("/");
        return `${ano}-${mes}-${dia}`;
    }

    function novoCliente() {
        let nome = prompt("Digite o nome do cliente:");
        if (nome) {
            let cliente = { id: gerarIdUnico(), nome: nome, gastos: [], pagamentos: [] };
            clientes.push(cliente);
            salvarDados();
            exibirClientes();
            alert("Cliente adicionado com sucesso!");
        }
    }

    function pesquisarCliente() {
        let input = document.getElementById("searchInput").value.toLowerCase();
        let clientesFiltrados = clientes.filter(cliente => 
            cliente.nome.toLowerCase().includes(input)
        );
        exibirClientes(clientesFiltrados);
    }

    function handleKeyPress(event) {
        if (event.keyCode === 13 || event.which === 13) {
            // Adiciona uma classe de efeito visual
            event.target.classList.add("search-activated");
            setTimeout(() => {
                event.target.classList.remove("search-activated");
            }, 200);
            pesquisarCliente();
        }
    }


    function abastecerEstoque() {
        let nomeProduto = prompt("Digite o nome do produto:");
        let preco = parseFloat(prompt("Digite o preço unitário do produto:"));

        if (nomeProduto && !isNaN(preco)) {
            let produto = { id: gerarIdUnico(), nome: nomeProduto, preco: preco };
            estoque.push(produto);
            salvarDados();
            alert("Produto adicionado com sucesso!");
            exibirEstoque();
        } else {
            alert("Dados inválidos. Por favor, tente novamente.");
        }
    }

    function toggleSelecaoProduto(idCliente) {
        // Fecha todas as outras seleções de produto
        document.querySelectorAll('.selecao-produto').forEach(el => {
            el.style.display = 'none';
        });

        // Se já está aberto, fecha
        let selecaoAtual = document.getElementById(`selecao-produto-${idCliente}`);
        if (selecaoAtual && selecaoAtual.style.display === 'block') {
            selecaoAtual.style.display = 'none';
            return;
        }

        // Abre a seleção para este cliente
        if (estoque.length === 0) {
            alert("Não há produtos cadastrados. Adicione produtos primeiro.");
            return;
        }

        let select = document.createElement('select');
        select.id = `produto-select-${idCliente}`;
        
        estoque.forEach((produto, index) => {
            let option = document.createElement('option');
            option.value = index;
            option.textContent = `${produto.nome} (R$ ${produto.preco.toFixed(2)})`;
            select.appendChild(option);
        });

        // Container para quantidade com botões + e -
        let quantidadeContainer = document.createElement('div');
        quantidadeContainer.className = 'quantidade-container';

        let diminuirBtn = document.createElement('button');
        diminuirBtn.className = 'quantidade-btn';
        diminuirBtn.textContent = '-';
        diminuirBtn.onclick = () => ajustarQuantidade(idCliente, -1);

        let quantidadeInput = document.createElement('input');
        quantidadeInput.type = 'number';
        quantidadeInput.id = `quantidade-input-${idCliente}`;
        quantidadeInput.className = 'quantidade-input';
        quantidadeInput.min = '1';
        quantidadeInput.value = '1';
        quantidadeInput.onchange = () => atualizarValorTotal(idCliente);

        let aumentarBtn = document.createElement('button');
        aumentarBtn.className = 'quantidade-btn';
        aumentarBtn.textContent = '+';
        aumentarBtn.onclick = () => ajustarQuantidade(idCliente, 1);

        quantidadeContainer.appendChild(diminuirBtn);
        quantidadeContainer.appendChild(quantidadeInput);
        quantidadeContainer.appendChild(aumentarBtn);

        // Container para mostrar o valor total
        let valorTotalContainer = document.createElement('div');
        valorTotalContainer.id = `valor-total-${idCliente}`;
        valorTotalContainer.className = 'valor-total';
        valorTotalContainer.textContent = 'Total: R$ 0.00';

        let confirmarBtn = document.createElement('button');
        confirmarBtn.textContent = 'Confirmar';
        confirmarBtn.onclick = () => confirmarGasto(idCliente);

        let cancelarBtn = document.createElement('button');
        cancelarBtn.textContent = 'Cancelar';
        cancelarBtn.onclick = () => selecaoAtual.style.display = 'none';

        selecaoAtual = document.createElement('div');
        selecaoAtual.id = `selecao-produto-${idCliente}`;
        selecaoAtual.className = 'selecao-produto';
        selecaoAtual.appendChild(select);
        selecaoAtual.appendChild(quantidadeContainer);
        selecaoAtual.appendChild(valorTotalContainer);
        selecaoAtual.appendChild(confirmarBtn);
        selecaoAtual.appendChild(cancelarBtn);

        let clienteRow = document.querySelector(`tr.cliente[data-id="${idCliente}"]`);
        if (clienteRow) {
            clienteRow.parentNode.insertBefore(selecaoAtual, clienteRow.nextSibling);
        }

        selecaoAtual.style.display = 'block';
        
        // Atualiza o valor total inicial
        atualizarValorTotal(idCliente);
    }

    function ajustarQuantidade(idCliente, delta) {
        let input = document.getElementById(`quantidade-input-${idCliente}`);
        let novaQuantidade = parseInt(input.value) + delta;
        
        if (novaQuantidade < 1) novaQuantidade = 1;
        
        input.value = novaQuantidade;
        atualizarValorTotal(idCliente);
    }

    function atualizarValorTotal(idCliente) {
        let select = document.getElementById(`produto-select-${idCliente}`);
        let quantidadeInput = document.getElementById(`quantidade-input-${idCliente}`);
        let valorTotalContainer = document.getElementById(`valor-total-${idCliente}`);
        
        if (!select || !quantidadeInput || !valorTotalContainer) return;
        
        let indexProduto = select.value;
        let quantidade = parseInt(quantidadeInput.value);
        
        if (isNaN(quantidade) || quantidade < 1) {
            quantidadeInput.value = 1;
            quantidade = 1;
        }
        
        let produto = estoque[indexProduto];
        let valorTotal = quantidade * produto.preco;
        
        valorTotalContainer.textContent = `Total: R$ ${valorTotal.toFixed(2)}`;
    }

    function confirmarGasto(idCliente) {
        let select = document.getElementById(`produto-select-${idCliente}`);
        let quantidadeInput = document.getElementById(`quantidade-input-${idCliente}`);
        
        if (!select || !quantidadeInput) return;

        let indexProduto = select.value;
        let quantidade = parseInt(quantidadeInput.value);

        if (isNaN(quantidade) || quantidade <= 0) {
            alert("Quantidade inválida.");
            return;
        }

        let produto = estoque[indexProduto];
        let valorTotal = quantidade * produto.preco;
        let dataHora = new Date().toISOString().split('T')[0];

        let cliente = clientes.find(c => c.id === idCliente);
        cliente.gastos.push({ 
            produto: produto.nome, 
            quantidade: quantidade, 
            valor: valorTotal, 
            data: formatarDataParaExibicao(dataHora) 
        });

        salvarDados();
        exibirClientes();
        
        // Fecha a seleção de produto
        document.getElementById(`selecao-produto-${idCliente}`).style.display = 'none';
    }

    function toggleEstoque() {
        let estoqueSection = document.getElementById("estoqueSection");
        estoqueSection.style.display = estoqueSection.style.display === "none" ? "block" : "none";
        exibirEstoque();
    }

    function exibirEstoque() {
        let estoqueTableBody = document.getElementById("estoqueTableBody");
        estoqueTableBody.innerHTML = "";

        estoque.forEach((produto, index) => {
            let row = `
                <tr>
                    <td>${produto.nome}</td>
                    <td>R$ ${produto.preco.toFixed(2)}</td>
                    <td>
                        <button onclick="excluirProduto(${index})">Excluir</button>
                    </td>
                </tr>
            `;
            estoqueTableBody.innerHTML += row;
        });
    }

    function excluirProduto(index) {
        if (confirm("Tem certeza que deseja excluir este produto?")) {
            estoque.splice(index, 1);
            salvarDados();
            exibirEstoque();
            alert("Produto excluído com sucesso!");
        }
    }

    function exibirClientes(clientesParaExibir = clientes) {
        let clientesTableBody = document.getElementById("clientesTableBody");
        clientesTableBody.innerHTML = "";

        const clientesOrdenados = ordenarClientes(clientesParaExibir);

        clientesParaExibir.forEach((cliente) => {
            let totalGasto = calcularTotal(cliente.gastos);
            let totalPago = calcularTotal(cliente.pagamentos);
            let valorPendente = totalGasto - totalPago;

            let clienteRow = `
                <tr class="cliente" data-id="${cliente.id}" onclick="toggleDetalhes('${cliente.id}')">
                    <td>${cliente.nome}</td>
                    <td>R$ ${valorPendente.toFixed(2)}</td>
                    <td class="actions-cell">
                        <button onclick="event.stopPropagation(); toggleSelecaoProduto('${cliente.id}')">Adicionar Gasto</button>
                        <button onclick="event.stopPropagation(); registrarPagamento('${cliente.id}')">Registrar Pagamento</button>
                        <button onclick="event.stopPropagation(); excluirCliente('${cliente.id}')">Excluir Cliente</button>
                    </td>
                </tr>
                <tr id="detalhes-${cliente.id}" class="detalhes" style="display: none;">
                    <td colspan="3">
                        <table width="100%">
                            <tr>
                                <th>Gastos</th>
                                <th>Pagamentos</th>
                            </tr>
                            <tr>
                                <td>
                                    ${cliente.gastos.map((gasto, i) => `
                                        <div class="gasto-container">
                                            ${gasto.produto} - 
                                            <div class="gasto-quantidade-container">
                                                <button class="gasto-quantidade-btn" onclick="event.stopPropagation(); alterarQuantidadeGasto('${cliente.id}', ${i}, -1)">-</button>
                                                <input type="number" class="gasto-quantidade-input" value="${gasto.quantidade}" min="1"
                                                    onchange="atualizarQuantidadeManual('${cliente.id}', ${i}, this.value)">
                                                <button class="gasto-quantidade-btn" onclick="event.stopPropagation(); alterarQuantidadeGasto('${cliente.id}', ${i}, 1)">+</button>
                                            </div>
                                            x R$ ${(gasto.valor / gasto.quantidade).toFixed(2)} = R$ ${gasto.valor.toFixed(2)} - <b>${gasto.data}</b>
                                            <button onclick="event.stopPropagation(); editarDataGasto('${cliente.id}', ${i})">Editar Data</button>
                                            <button onclick="event.stopPropagation(); excluirGasto('${cliente.id}', ${i})" class="delete-btn">Excluir</button>
                                        </div>
                                    `).join("")}
                                </td>
                                <td>
                                    ${cliente.pagamentos.map((pagamento, i) => `
                                        R$ ${pagamento.valor.toFixed(2)} - <b>${pagamento.data}</b>
                                        <button onclick="event.stopPropagation(); editarDataPagamento('${cliente.id}', ${i})">Editar Data</button>
                                        <button onclick="event.stopPropagation(); excluirPagamento('${cliente.id}', ${i})" class="delete-btn">Excluir</button>
                                    `).join("<br>")}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;

            clientesTableBody.innerHTML += clienteRow;
        });
    }

    function atualizarQuantidadeManual(idCliente, indexGasto, novaQuantidade) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente || !cliente.gastos[indexGasto]) return;
        
        novaQuantidade = parseInt(novaQuantidade);
        
        if (isNaN(novaQuantidade)) {
            alert("Quantidade inválida!");
            exibirClientes(); // Recarrega para mostrar o valor anterior
            return;
        }
        
        if (novaQuantidade < 1) {
            alert("A quantidade não pode ser menor que 1");
            exibirClientes(); // Recarrega para mostrar o valor anterior
            return;
        }
        
        // Encontra o produto no estoque para obter o preço unitário correto
        let produto = estoque.find(p => p.nome === cliente.gastos[indexGasto].produto);
        if (!produto) {
            alert("Produto não encontrado no estoque!");
            return;
        }
        
        // Atualiza a quantidade e recalcula o valor total com o preço unitário do estoque
        cliente.gastos[indexGasto].quantidade = novaQuantidade;
        cliente.gastos[indexGasto].valor = produto.preco * novaQuantidade;
        
        salvarDados();
        exibirClientes();
    }

    function alterarQuantidadeGasto(idCliente, indexGasto, delta) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente || !cliente.gastos[indexGasto]) return;
        
        let novaQuantidade = cliente.gastos[indexGasto].quantidade + delta;
        
        if (novaQuantidade < 1) {
            alert("A quantidade não pode ser menor que 1");
            return;
        }
        
        // Encontra o produto no estoque para obter o preço unitário correto
        let produto = estoque.find(p => p.nome === cliente.gastos[indexGasto].produto);
        if (!produto) {
            alert("Produto não encontrado no estoque!");
            return;
        }
        
        // Atualiza a quantidade e recalcula o valor total com o preço unitário do estoque
        cliente.gastos[indexGasto].quantidade = novaQuantidade;
        cliente.gastos[indexGasto].valor = produto.preco * novaQuantidade;
        
        salvarDados();
        exibirClientes();
    }

    function editarDataPagamento(idCliente, indexPagamento) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente) return;

        let novaData = prompt("Digite a nova data (DD/MM/YYYY):", cliente.pagamentos[indexPagamento].data);
        if (!novaData || !/^\d{2}\/\d{2}\/\d{4}$/.test(novaData)) {
            alert("Formato de data inválido!");
            return;
        }

        cliente.pagamentos[indexPagamento].data = novaData;
        salvarDados();
        exibirClientes();
    }

    function excluirCliente(idCliente) {
        if (confirm("Tem certeza que deseja excluir este cliente?")) {
            clientes = clientes.filter(cliente => cliente.id !== idCliente);
            salvarDados();
            exibirClientes();
        }
    }

    function excluirGasto(idCliente, indexGasto) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente) return;

        if (confirm("Tem certeza que deseja excluir este gasto?")) {
            cliente.gastos.splice(indexGasto, 1);
            salvarDados();
            exibirClientes();
        }
    }

    function excluirPagamento(idCliente, indexPagamento) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente) return;

        if (confirm("Tem certeza que deseja excluir este pagamento?")) {
            cliente.pagamentos.splice(indexPagamento, 1);
            salvarDados();
            exibirClientes();
        }
    }

    function calcularTotal(lista) {
        return lista.reduce((total, item) => total + item.valor, 0);
    }

    function toggleDetalhes(idCliente) {
        let detalhes = document.getElementById(`detalhes-${idCliente}`);
        detalhes.style.display = detalhes.style.display === "none" ? "table-row" : "none";
    }

    function registrarPagamento(idCliente) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente) {
            alert("Cliente não encontrado.");
            return;
        }

        // Calcula o valor pendente do cliente
        let totalGasto = calcularTotal(cliente.gastos);
        let totalPago = calcularTotal(cliente.pagamentos);
        let valorPendente = totalGasto - totalPago;

        if (valorPendente <= 0) {
            alert("Este cliente não possui valor pendente para pagamento.");
            return;
        }

        let valorPagamento = parseFloat(prompt(`Digite o valor do pagamento (Valor pendente: R$ ${valorPendente.toFixed(2)}):`));
        if (isNaN(valorPagamento) || valorPagamento <= 0) {
            alert("Valor inválido. Digite um valor maior que zero.");
            return;
        }

        if (valorPagamento > valorPendente) {
            alert("O valor do pagamento é maior do que o valor pendente.");
            return;
        }

        let dataHora = new Date().toISOString().split('T')[0];
        cliente.pagamentos.push({
            valor: valorPagamento,
            data: formatarDataParaExibicao(dataHora)
        });

        salvarDados();
        exibirClientes();
        alert("Pagamento registrado com sucesso!");
    }

    function editarDataGasto(idCliente, indexGasto) {
        let cliente = clientes.find(c => c.id === idCliente);
        if (!cliente) {
            alert("Cliente não encontrado.");
            return;
        }

        let gasto = cliente.gastos[indexGasto];
        if (!gasto) {
            alert("Gasto não encontrado.");
            return;
        }

        let novaData = prompt("Digite a nova data (DD/MM/YYYY):", gasto.data);
        if (!novaData || !/^\d{2}\/\d{2}\/\d{4}$/.test(novaData)) {
            alert("Formato de data inválido! Use o formato DD/MM/YYYY.");
            return;
        }

        // Atualiza a data do gasto
        gasto.data = novaData;
        salvarDados();
        exibirClientes();
        alert("Data do gasto atualizada com sucesso!");
    }

    function ordenarClientes(clientes) {
        return clientes.sort((a, b) => {
            const nomeA = a.nome.toUpperCase();
            const nomeB = b.nome.toUpperCase();
            if (nomeA < nomeB) return -1;
            if (nomeA > nomeB) return 1;
            return 0;
        });
    }

    exibirClientes();




