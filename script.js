const API_CADASTRO = "https://backend-node-nmze.onrender.com/register";
const API_PUBLICACOES = "https://api-progweb.onrender.com/posts";
const API_GAMES = "https://api-progweb.onrender.com/games";

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

    if (dados.senha.length < 8) {
        erros.push("Senha: a senha precisa ter pelo menos 8 caracteres.");
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

function exibirMensagemPublicacoes(texto, tipo) {
    const mensagem = document.getElementById("mensagem-publicacoes");

    mensagem.className = `mensagem ${tipo}`;
    mensagem.textContent = texto;
}

function formatarDataPublicacao(data) {
    const dataPublicacao = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataPublicacao.getTime())) {
        return data;
    }

    return dataPublicacao.toLocaleDateString("pt-BR");
}

function criarCardPublicacao(publicacao) {
    const card = document.createElement("article");
    card.className = "card-publicacao";

    const foto = document.createElement("img");
    foto.src = publicacao.fotoAutor;
    foto.alt = `Foto de ${publicacao.autor}`;

    const titulo = document.createElement("h2");
    titulo.textContent = publicacao.titulo;

    const descricao = document.createElement("p");
    descricao.textContent = publicacao.descricao;

    const autor = document.createElement("p");
    autor.className = "autor-publicacao";
    autor.textContent = publicacao.autor;

    const data = document.createElement("p");
    data.className = "data-publicacao";
    data.textContent = formatarDataPublicacao(publicacao.dataPublicacao);

    card.append(foto, titulo, descricao, autor, data);

    return card;
}

async function carregarPublicacoes() {
    const lista = document.getElementById("lista-publicacoes");

    try {
        const resposta = await fetch(API_PUBLICACOES);

        if (!resposta.ok) {
            throw new Error("Erro na API");
        }

        const publicacoes = await resposta.json();

        publicacoes.forEach((publicacao) => {
            lista.appendChild(criarCardPublicacao(publicacao));
        });

        exibirMensagemPublicacoes(`${publicacoes.length} publicações carregadas.`, "sucesso");
    } catch (erro) {
        console.error(erro);
        exibirMensagemPublicacoes("Não foi possível carregar as publicações. Tente novamente mais tarde.", "erro");
    }
}

const listaPublicacoes = document.getElementById("lista-publicacoes");

if (listaPublicacoes) {
    carregarPublicacoes();
}

function exibirMensagemGames(texto, tipo) {
    const mensagem = document.getElementById("mensagem-games");

    mensagem.className = `mensagem ${tipo}`;
    mensagem.textContent = texto;
}

function preencherTabelaGames(games) {
    const corpoTabela = document.getElementById("corpo-tabela-games");

    corpoTabela.innerHTML = "";

    games.forEach((game) => {
        const linha = document.createElement("tr");
        const id = document.createElement("td");
        const nome = document.createElement("td");
        const categoria = document.createElement("td");
        const ranking = document.createElement("td");

        id.textContent = game.id;
        nome.textContent = game.nome;
        categoria.textContent = game.categoria;
        ranking.textContent = game.ranking;

        linha.append(id, nome, categoria, ranking);
        corpoTabela.appendChild(linha);
    });
}

async function carregarGames() {
    try {
        const resposta = await fetch(API_GAMES);

        if (!resposta.ok) {
            throw new Error("Erro na API");
        }

        const games = await resposta.json();

        preencherTabelaGames(games);
        exibirMensagemGames(`${games.length} jogos carregados pela API.`, "sucesso");
    } catch (erro) {
        console.error(erro);
        exibirMensagemGames("Não foi possível carregar os jogos pela API /games.", "erro");
    }
}

const corpoTabelaGames = document.getElementById("corpo-tabela-games");

if (corpoTabelaGames) {
    carregarGames();
}
