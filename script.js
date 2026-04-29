const API_CADASTRO = "https://backend-node-nmze.onrender.com/register";

function pegarValor(id) {
    return document.getElementById(id).value.trim();
}

function validarCadastro(dados) {
    const erros = [];

    const partesNome = dados.nomeSobrenome.split(/\s+/).filter(Boolean);
    if (partesNome.length < 2) {
        erros.push("Nome e sobrenome: digite pelo menos duas palavras. Exemplo: Pedro Baldi.");
    }

    const telefoneValido = /^\(\d{2}\) \d{5}-\d{4}$/.test(dados.telefone);
    if (!telefoneValido) {
        erros.push("Telefone: use o formato correto (00) 00000-0000.");
    }

    const cepValido = /^\d{5}-\d{3}$/.test(dados.cep);
    if (!cepValido) {
        erros.push("CEP: use o formato correto 00000-000.");
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email);
    if (!emailValido) {
        erros.push("Email: digite um endereço válido. Exemplo: nome@email.com.");
    }

    if (dados.senha.length < 6) {
        erros.push("Senha: a senha precisa ter pelo menos 6 caracteres.");
    }

    if (dados.senha !== dados.confirmarSenha) {
        erros.push("Confirmação de senha: os dois campos de senha precisam ser iguais.");
    }

    return erros;
}

function exibirErros(erros) {
    const mensagem = document.getElementById("mensagem");
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "";
    mensagem.className = "mensagem erro";
    mensagem.innerHTML = `
        <strong>Foram encontrados os seguintes erros:</strong>
        <ul>
            ${erros.map((erro) => `<li>${erro}</li>`).join("")}
        </ul>
    `;
}

function exibirCarregando() {
    const mensagem = document.getElementById("mensagem");
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "";
    mensagem.className = "mensagem aviso";
    mensagem.textContent = "Enviando cadastro para a API, aguarde...";
}

function exibirSucesso(dados, gift) {
    const mensagem = document.getElementById("mensagem");
    const resultado = document.getElementById("resultado");

    mensagem.className = "mensagem sucesso";
    mensagem.textContent = "Cadastro enviado com sucesso.";

    resultado.innerHTML = `
        <p>
            <strong><em>Parabéns <span>${dados.nomeSobrenome}</span> você realizou seu cadastro com o email <span>${dados.email}</span>, entraremos em contato através do seu telefone <span>${dados.telefone}</span>, você ganhou este prêmio <span>${gift}</span></em></strong>
        </p>
    `;
}

function exibirErroApi() {
    const mensagem = document.getElementById("mensagem");
    const resultado = document.getElementById("resultado");

    resultado.innerHTML = "";
    mensagem.className = "mensagem erro";
    mensagem.textContent = "Não foi possível enviar o cadastro. A API pode estar fora do ar. Tente novamente mais tarde.";
}

function aplicarMascaraTelefone(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
}

function aplicarMascaraCep(valor) {
    return valor
        .replace(/\D/g, "")
        .replace(/^(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
}

async function enviarFormulario(event) {
    event.preventDefault();

    const dados = {
        nomeSobrenome: pegarValor("nomeSobrenome"),
        telefone: pegarValor("telefone"),
        cep: pegarValor("cep"),
        email: pegarValor("email"),
        senha: pegarValor("senha"),
        confirmarSenha: pegarValor("confirmarSenha")
    };

    const erros = validarCadastro(dados);

    if (erros.length > 0) {
        exibirErros(erros);
        return;
    }

    exibirCarregando();

    try {
        const resposta = await fetch(API_CADASTRO, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error("Erro na API");
        }

        const texto = await resposta.text();
        let retornoApi;

        try {
            retornoApi = JSON.parse(texto);
        } catch {
            retornoApi = { gift: texto };
        }

        const gift = retornoApi.gift || retornoApi.prize || retornoApi.premio || retornoApi.message || "prêmio não informado";
        exibirSucesso(dados, gift);
    } catch (erro) {
        console.error(erro);
        exibirErroApi();
    }
}

const formularioCadastro = document.getElementById("formulario-cadastro");

if (formularioCadastro) {
    formularioCadastro.addEventListener("submit", enviarFormulario);

    const campoTelefone = document.getElementById("telefone");
    const campoCep = document.getElementById("cep");

    campoTelefone.addEventListener("input", () => {
        campoTelefone.value = aplicarMascaraTelefone(campoTelefone.value);
    });

    campoCep.addEventListener("input", () => {
        campoCep.value = aplicarMascaraCep(campoCep.value);
    });
}
