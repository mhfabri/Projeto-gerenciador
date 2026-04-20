<?php
session_start();

if (isset($_SESSION['logado'])) {
    header("Location: index.php");
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
    <h1>Login</h1>

    <form method="POST" action="auth.php">
        <input id="username" type="text" name="username" placeholder="Usuario" required>
        <input id="password" type="password" name="password" placeholder="Senha" required>
        <button class="verify" type="submit">Entrar</button>
    </form>
<script src="assets/script.js"></script>
</body>
</html>