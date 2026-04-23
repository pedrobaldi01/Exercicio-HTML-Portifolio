function enviarFormulario(event) {
    event.preventDefault();
    const nomeSobrenome = document.querySelector('input[name="nomeSobrenome"]').value;
    const telefone = document.querySelector('input[name="telefone"]').value;
    const cep = document.querySelector('input[name="cep"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const senha = document.querySelector('input[name="senha"]').value;
    const confirmarSenha = document.querySelector('input[name="confirmarSenha"]').value;
    console.log(nomeSobrenome, telefone, cep, email, senha, confirmarSenha);
}

const form = document.getElementById("formulario-cadastro");
if (form) {
    form.addEventListener("submit", enviarFormulario);
}