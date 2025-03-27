const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Substitua pela sua senha
    database: "gerenciamento_clientes"
});

db.connect(err => {
    if (err) throw err;
    console.log("Conectado ao banco de dados!");
});

// Adicionar Cliente
app.post("/clientes", (req, res) => {
    const { nome } = req.body;
    db.query("INSERT INTO clientes (nome) VALUES (?)", [nome], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, nome });
    });
});

// Buscar Clientes
app.get("/clientes", (req, res) => {
    db.query("SELECT * FROM clientes", (err, result) => {
        if (err) throw err;
        res.send(result);
    });
});

// Adicionar Gasto
app.post("/gastos", (req, res) => {
    const { cliente_id, valor, data } = req.body;
    db.query("INSERT INTO gastos (cliente_id, valor, data) VALUES (?, ?, ?)", 
    [cliente_id, valor, data], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, cliente_id, valor, data });
    });
});

// Adicionar Pagamento
app.post("/pagamentos", (req, res) => {
    const { cliente_id, valor, data } = req.body;
    db.query("INSERT INTO pagamentos (cliente_id, valor, data) VALUES (?, ?, ?)", 
    [cliente_id, valor, data], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, cliente_id, valor, data });
    });
});

// Iniciar Servidor
app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
