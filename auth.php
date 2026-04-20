<?php
session_start();

// Usuário fixo (depois você pode colocar banco de dados)
$usuario_correto = "admin";
$senha_correta = "1234";

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if ($username === $usuario_correto && $password === $senha_correta) {
    $_SESSION['logado'] = true;
    header("Location: index.php");
    exit;
} else {
    echo "<script>alert('Usuário ou senha incorretos!'); window.location.href='login.php';</script>";
}