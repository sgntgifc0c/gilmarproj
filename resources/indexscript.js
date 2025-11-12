/* ------------------------
   Variáveis principais
   ------------------------*/
const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendSound = document.getElementById("sendSound");
const receiveSound = document.getElementById("receiveSound");
const micButton = document.getElementById("micButton");
const toggleSidebar = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");

const btnSearch = document.getElementById("btnSearch");
const btnSettings = document.getElementById("btnSettings");
const btnHistory = document.getElementById("btnHistory");
const btnIdeias = document.getElementById("btnIdeias");
const submenu = document.getElementById("ideiasSubmenu");

const btnExportarTXT = document.getElementById("btnExportarTXT");
const btnExportarJSON = document.getElementById("btnExportarJSON");
const btnLimparHistorico = document.getElementById("btnLimparHistorico");

const searchPanel = document.getElementById("searchPanel");
const settingsPanel = document.getElementById("settingsPanel");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const btnCreditos = document.getElementById("btnCreditos");
const creditsModal = document.getElementById("creditsModal");
const creditsRoll = document.getElementById("creditsRoll");
const closeCreditsBtn = document.getElementById("closeCreditsBtn");

sendSound.volume = 0.3;
receiveSound.volume = 0.35;

/* ------------------------
   Tema
   ------------------------*/
themeToggle.addEventListener("click", () => {
  if (body.classList.contains("light")) {
    body.classList.replace("light", "dark");
    themeToggle.textContent = "🔆";
  } else {
    body.classList.replace("dark", "light");
    themeToggle.textContent = "🌙";
  }
});

/* ------------------------
   Toggle sidebar
   ------------------------*/
toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
  mainContent.classList.toggle("fullWidth");
});

/* ------------------------
   Sistema de histórico
   ------------------------*/
let historico = JSON.parse(localStorage.getItem("yuriHistorico")) || [];
let chatAtual = [];
let painelAtivo = null;

// Atualiza a lista de histórico no painel
function atualizarListaHistorico() {
  historyList.innerHTML = "";
  if (historico.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma conversa salva.";
    li.style.opacity = 0.7;
    li.style.padding = "8px 4px";
    historyList.appendChild(li);
    return;
  }

  historico.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.titulo;
    li.style.cursor = "pointer";
    li.style.padding = "8px";
    li.style.borderBottom = "1px solid rgba(0,0,0,0.06)";
    li.addEventListener("click", () => carregarConversa(item.id));
    historyList.appendChild(li);
  });
}

// Salvar conversa atual no histórico (no topo)
function salvarConversa() {
  if (chatAtual.length === 0) return;
  const titulo =
    chatAtual
      .find((m) => m.role === "user")
      ?.conteudo?.replace(/<[^>]+>/g, "")
      ?.substring(0, 40) || "Nova conversa";
  const novo = {
    id: Date.now(),
    titulo,
    mensagens: [...chatAtual],
  };
  // evita duplicar se último item for igual
  if (
    historico[0] &&
    JSON.stringify(historico[0].mensagens) === JSON.stringify(novo.mensagens)
  ) {
    // já salvo
  } else {
    historico.unshift(novo);
    if (historico.length > 50) historico.pop();
    localStorage.setItem("yuriHistorico", JSON.stringify(historico));
    atualizarListaHistorico();
  }
}

// Carregar conversa do histórico na tela e permitir continuar
function carregarConversa(id) {
  const chat = historico.find((c) => c.id === id);
  if (!chat) return;
  chatMessages.innerHTML = "";
  chat.mensagens.forEach((m) => {
    const div = document.createElement("div");
    div.classList.add("message", m.role);
    div.innerHTML = m.conteudo;
    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatAtual = [...chat.mensagens]; // permite continuar
  // fechar painel
  hidePanels();
}

/* Registrar mensagem no chatAtual e salvar último chat temporário */
function registrarMensagem(role, conteudo) {
  const item = { role, conteudo };
  chatAtual.push(item);
  localStorage.setItem("yuriUltimoChat", JSON.stringify(chatAtual));
}

/* Ao carregar a página, tenta recuperar o último chat não salvo */
window.addEventListener("load", () => {
  const ultimo = JSON.parse(localStorage.getItem("yuriUltimoChat"));
  if (ultimo && ultimo.length > 0) {
    chatAtual = ultimo;
    chatAtual.forEach((m) => {
      const div = document.createElement("div");
      div.classList.add("message", m.role);
      div.innerHTML = m.conteudo;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  atualizarListaHistorico();
});

// API crawl
async function crawlMessage(prompt, botMsg, typing) {
  let resp = "";
  await fetch("/promptman", {
    method: "POST",
    body: JSON.stringify({
      request: prompt,
      cookie_session: "",
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP Error: status ${res.status}`);
      }
      return res.json();
    })
    .then((res) => {
      console.log(res);
      typing.remove();
      resp = res.text;
      console.log(res.text);
      botMsg.innerHTML = "💬 " + resp;
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      //receiveSound.currentTime = 0;
      //receiveSound.play();
      registrarMensagem("bot", "💬 " + resp);
      salvarConversa();
    })
    .catch((e) => {
      throw new e();
    });
}

/* ------------------------
   Funções de envio / resposta
   ------------------------*/

// Função principal de envio
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // criar e mostrar mensagem do usuário
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);
  sendSound.currentTime = 0;
  sendSound.play();
  registrarMensagem("user", text);

  // mostrar "digitando..."
  const typing = document.createElement("div");
  typing.classList.add("message", "bot");
  typing.innerHTML =
    "💬 Yuri está digitando <span class='typing'></span><span class='typing'></span><span class='typing'></span>";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // setTimeout(() => {
  const botMsg = document.createElement("div");
  botMsg.classList.add("message", "bot");
  crawlMessage(userInput.value, botMsg, typing);
  // }, 1000);

  userInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Permite enviar com Enter
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* Função para criar novo chat (limpa sem apagar histórico) */
function newChat() {
  chatMessages.innerHTML =
    '<div class="message bot">Olá, sou Yuri!<br>Como posso te ajudar hoje? ☺️</div>';
  chatAtual = [];
  localStorage.removeItem("yuriUltimoChat");
}

/* ------------------------
   Respostas inteligentes e ideias por área
   ------------------------*/
function gerarRespostaFake(text) {
  const msg = (text || "").toLowerCase();

  // detectar pedidos de ideias/trabalhos
  if (
    msg.includes("ideia") ||
    msg.includes("trabalho") ||
    msg.includes("tema") ||
    msg.includes("pesquisa") ||
    msg.includes("tcc")
  ) {
    // se o usuário especificou a área no texto, usar gerarIdeiasPorArea
    const areas = [
      "tecnologia",
      "meio ambiente",
      "saúde",
      "história",
      "sociedade",
      "geral",
      "tecnologia",
    ];
    for (const a of areas) {
      if (msg.includes(a)) {
        return gerarIdeiasPorArea(a);
      }
    }
    // senao, retornar geral
    return gerarIdeiasPorArea("geral");
  }

  // respostas padrão
  const respostas = [
    "A mesma personalidade MBTI do Kisaki de Tokyo Revengers e Shinobu Kocho de Demon Slayer, assim também é a Beatriz, minha criadora! 😊",
    "Sim, eu falo japonês, inglês e um pouco de português! E você? 😊",
    "Eu adoro vários personagens, mas meus favoritos são os irmãos Haitani de 'Tokyo Revengers' e Giyu Tomioka de 'Demon Slayer'! E os seus? 😊",
    "Infelizmente não, sou somente um assistente pronto pra te ajudar! 😊",
    "Além da Beatriz, a Creativa foi idealizada e moldada por um grupo de alunos incríveis: Wigna, Nicolas, Pedro, Erick, Jhonatan e Henrique! 😊",
    "Creativa significa CRIATIVIDADE ATIVA, e foi idealizado pela minha criadora para um projeto da faculdade! 😊",
    "Eu adoro vários animes, mas meus favoritos são 'Tokyo Revengers' e 'Kimetsu no Yaiba'! E o seu? 😊",
    "Estou ótimo, obrigado por perguntar! E você, como está se sentindo hoje? 😊",
    "Adoro várias músicas, mas minhas favoritas são 'Matryoshka' do Vocaloid e 'Starlight' do Babymetal! E a sua? 😊",
    "Minha cor favorita é azul, assim como a minha criadora! Gosto muito do céu e do mar! E a sua? 😊",
    "Eu tenho 19 anos! Sou estudante universitário! Faço Ciência da Computação.",
    "Foi a aluna Beatriz Gonçalves que me criou, desde a ideia, história, concepção e até o design, ela é incrível! 😊",
    "O meu nome completo significa Lírio, trabalhador ou luz de Deus (Yuri) e Ajuda ou Assistência (Sasaki) 😊",
    "Nasci em Shibuya em Tóquio, Japão! Mas como meu pai é brasileiro, eu tenho dupla nacionalidade! 🇯🇵🇧🇷",
    "Eu adoro programar, jogar videogame, ouvir música, assistir animes e filmes, além de explorar novas tecnologias! E você? 😊",
    "Eu amo comida japonesa, mas confesso que a brasileira, especialmente a comida baiana, é deliciosa! 🍣🍛",
  ];
  return respostas[Math.floor(Math.random() * respostas.length)];
}

function gerarIdeiasPorArea(area) {
  const ideias = {
    geral: [
      "A importância da criatividade na resolução de problemas.",
      "Como a tecnologia influencia a vida cotidiana.",
      "Os impactos das redes sociais no comportamento humano.",
      "A ética no uso da inteligência artificial.",
      "A sustentabilidade como pilar do futuro.",
    ],
    tecnologia: [
      "A evolução da inteligência artificial e seu impacto na sociedade.",
      "Cibersegurança: como proteger dados pessoais online.",
      "A importância da programação na educação moderna.",
      "O papel da robótica na automação industrial.",
      "Como os aplicativos estão transformando o mundo.",
    ],
    "meio ambiente": [
      "Soluções tecnológicas para o aquecimento global.",
      "A importância da reciclagem e economia circular.",
      "Energias renováveis: alternativas ao uso de combustíveis fósseis.",
      "O impacto das mudanças climáticas nas cidades costeiras.",
      "Agricultura sustentável e conservação ambiental.",
    ],
    saúde: [
      "A influência da tecnologia na medicina moderna.",
      "Saúde mental na era digital.",
      "Avanços da biotecnologia e da genética.",
      "O papel da nutrição na prevenção de doenças.",
      "Uso ético da inteligência artificial na medicina.",
    ],
    história: [
      "O impacto da Revolução Industrial na sociedade moderna.",
      "Como a Segunda Guerra Mundial moldou o mundo atual.",
      "A importância dos movimentos de independência no século XIX.",
      "A influência da cultura japonesa na história contemporânea.",
      "O papel das mulheres nas revoluções históricas.",
    ],
    sociedade: [
      "Desigualdade social e educação no Brasil.",
      "O impacto das mídias digitais nas relações humanas.",
      "Empreendedorismo jovem e inovação social.",
      "A importância da diversidade e inclusão nas empresas.",
      "O papel da arte na transformação social.",
    ],
  };

  const lista = ideias[area] || ideias["geral"];
  const sugestao = lista[Math.floor(Math.random() * lista.length)];
  return `Aqui vai uma ideia de trabalho sobre <b>${area}</b>: <br><br>💡 <b>${sugestao}</b><br><br>Quer que eu te ajude a desenvolver o roteiro desse tema?`;
}

/* ------------------------
   Botões / Submenu de Ideias
   ------------------------*/
btnIdeias.addEventListener("click", () => {
  submenu.style.display =
    submenu.style.display === "none" || submenu.style.display === ""
      ? "block"
      : "none";
});

document.querySelectorAll(".subIdeia").forEach((btn) => {
  btn.addEventListener("click", () => {
    const area = btn.getAttribute("data-area");
    submenu.style.display = "none";

    // criar mensagem do usuário no chat
    const userMsg = document.createElement("div");
    userMsg.classList.add("message", "user");
    userMsg.textContent = `Me dê uma ideia de trabalho sobre ${area}`;
    chatMessages.appendChild(userMsg);
    sendSound.currentTime = 0;
    sendSound.play();
    registrarMensagem("user", `Me dê uma ideia de trabalho sobre ${area}`);

    // mostra "digitando"
    const typing = document.createElement("div");
    typing.classList.add("message", "bot");
    typing.innerHTML =
      "💬 Yuri está digitando <span class='typing'></span><span class='typing'></span><span class='typing'></span>";
    chatMessages.appendChild(typing);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typing.remove();
      const resposta = gerarIdeiasPorArea(area);
      const botMsg = document.createElement("div");
      botMsg.classList.add("message", "bot");
      botMsg.innerHTML = "💬 " + resposta;
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      receiveSound.currentTime = 0;
      receiveSound.play();

      registrarMensagem("bot", "💬 " + resposta);
      salvarConversa();
    }, 900);
  });
});

/* ------------------------
   Microfone (speech recognition)
   ------------------------*/
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;
  micButton.addEventListener("click", () => {
    if (micButton.classList.contains("active")) {
      recognition.stop();
      micButton.classList.remove("active");
    } else {
      recognition.start();
      micButton.classList.add("active");
    }
  });
  recognition.onresult = (event) => {
    userInput.value = event.results[0][0].transcript;
    sendMessage();
  };
  recognition.onend = () => {
    micButton.classList.remove("active");
  };
} else {
  micButton.style.display = "none";
}

/* ------------------------
   Painéis: abrir/fechar com toggle
   ------------------------*/
function hidePanels() {
  searchPanel.style.display = "none";
  settingsPanel.style.display = "none";
  historyPanel.style.display = "none";
  painelAtivo = null;
}

btnSearch.addEventListener("click", () =>
  togglePainel(searchPanel, "pesquisa"),
);
btnSettings.addEventListener("click", () =>
  togglePainel(settingsPanel, "config"),
);
btnHistory.addEventListener("click", () =>
  togglePainel(historyPanel, "historico"),
);

function togglePainel(painel, nome) {
  if (painelAtivo === nome) {
    hidePanels();
    // deixar foco no chat
  } else {
    hidePanels();
    painel.style.display = "block";
    painelAtivo = nome;
    if (nome === "pesquisa") {
      // foco no campo de pesquisa
      setTimeout(() => searchInput.focus(), 120);
    }
  }
}

/* ------------------------
   Pesquisar chat (no chat atual mostrado e no histórico)
   - resultados clicáveis (abre conversa / navega direto)
   - Enter abre o primeiro resultado
   ------------------------*/
function makeSearchResults(term) {
  searchResults.innerHTML = "";
  const q = (term || "").trim().toLowerCase();
  if (q === "") return;

  // 1) pesquisar no histórico (conversas salvas)
  historico.forEach((chat) => {
    // procurar se alguma mensagem da conversa contém o termo
    const matchMsg = chat.mensagens.find((m) =>
      (m.conteudo || "").toLowerCase().includes(q),
    );
    if (matchMsg) {
      const li = document.createElement("li");
      li.style.padding = "8px";
      li.style.borderBottom = "1px solid rgba(0,0,0,0.06)";
      li.style.cursor = "pointer";
      li.innerHTML = `<strong>${chat.titulo}</strong><div style="font-size:13px; margin-top:6px; opacity:0.85;">${matchMsg.conteudo.replace(/<[^>]+>/g, "").substring(0, 120)}...</div>`;
      li.dataset.chatId = chat.id;
      li.addEventListener("click", () => {
        carregarConversa(chat.id);
        hidePanels();
      });
      searchResults.appendChild(li);
    }
  });

  // 2) pesquisar no chat atual visível
  const msgs = [...chatMessages.querySelectorAll(".message")];
  msgs.forEach((m, idx) => {
    if (m.textContent.toLowerCase().includes(q)) {
      const li = document.createElement("li");
      li.style.padding = "8px";
      li.style.borderBottom = "1px solid rgba(0,0,0,0.06)";
      li.style.cursor = "pointer";
      li.textContent = m.textContent.replace(/\n/g, " ").substring(0, 140);
      li.dataset.currentIndex = idx;
      li.addEventListener("click", () => {
        // ir diretamente para a mensagem no chat atual
        const target = chatMessages.querySelectorAll(".message")[idx];
        if (target) {
          // garante que o chat atual esteja visível (não carregando outra conversa)
          // highlight temporário:
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          target.style.transition = "box-shadow 0.3s";
          const old = target.style.boxShadow;
          target.style.boxShadow = "0 0 18px rgba(255,200,0,0.9)";
          setTimeout(() => (target.style.boxShadow = old), 1800);
          hidePanels();
        }
      });
      searchResults.appendChild(li);
    }
  });

  // mensagem se nada encontrado
  if (searchResults.children.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhum resultado encontrado.";
    li.style.opacity = 0.7;
    li.style.padding = "8px";
    searchResults.appendChild(li);
  }
}

searchInput.addEventListener("input", (e) => {
  makeSearchResults(e.target.value);
});

// abrir primeiro resultado com Enter
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const first = searchResults.querySelector("li");
    if (first) {
      first.click();
    }
  }
});

/* ------------------------
   Exportar histórico e limpar
   ------------------------*/
btnExportarTXT.addEventListener("click", () => {
  if (historico.length === 0) {
    alert("Nenhuma conversa para exportar!");
    return;
  }
  let conteudo = "=== Histórico do Chat Yuri ===\n\n";
  historico.forEach((chat, i) => {
    conteudo += `🗂️ Conversa ${i + 1}: ${chat.titulo}\n`;
    chat.mensagens.forEach((m) => {
      conteudo += `${m.role === "user" ? "👤 Usuário" : "🤖 Yuri"}: ${m.conteudo.replace(/<[^>]+>/g, "")}\n`;
    });
    conteudo += "\n-------------------------------\n\n";
  });
  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "historico_yuri.txt";
  link.click();
});

btnExportarJSON.addEventListener("click", () => {
  if (historico.length === 0) {
    alert("Nenhuma conversa para exportar!");
    return;
  }
  const blob = new Blob([JSON.stringify(historico, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "historico_yuri.json";
  link.click();
});

btnLimparHistorico.addEventListener("click", () => {
  if (
    confirm(
      "Tem certeza que deseja apagar todo o histórico de conversas? Esta ação não pode ser desfeita.",
    )
  ) {
    historico = [];
    localStorage.removeItem("yuriHistorico");
    atualizarListaHistorico();
    alert("🧹 Histórico limpo com sucesso!");
  }
});

/* ------------------------
   Tutorial
   - adicionei o passo sobre o botão de ideias conforme solicitado
   ------------------------*/
const tutorialSteps = [
  {
    user: ["Me fale como posso usar o chat"],
    yuri: "Ah, é simples! É só conversar comigo, e enviar apertando no botão ou clicando nesse botão azul de seta branca, eu vou lhe responder da forma adequada!",
  },
  {
    user: ["E se eu quiser achar uma conversa que eu tive com você?"],
    yuri: "Fácil demais! Clica na lupa escrito 'Pesquisa' no menu lateral e digite a palavra chave que você se lembrar!",
  },
  {
    user: ["E se eu quiser procurar manualmente?"],
    yuri: "Apertando no relógio escrito 'Histórico' você encontra manualmente todas as suas conversas e pode apagar pra economizar espaço!",
  },
  {
    user: ["E se eu quiser um chat limpo?"],
    yuri: "Fácil! Clicando em 'Novo Chat' que tem o símbolo de mais, você ganha uma conversa nova e limpa automaticamente!",
  },
  {
    user: ["O que significa essas três barras ao lado do seu nome?"],
    yuri: "Ah! Elas escondem para tela cheia e garantir foco, mas elas reaparecem de novo quando são clicadas.",
  },
  {
    user: ["Estou curioso sobre você!"],
    yuri: "Sério? Bem! É... Então pergunte coisas saudáveis sobre mim que eu vou responder com carinho!",
  },
  {
    user: ["Do que você gosta de falar"],
    yuri: "Você pode perguntar o significado do meu nome, a minha idade, minha nacionalidade, do que eu gosto, meus hobbies, minha música favorita, minha comida favorita, minha cor favorita, quem me criou, quem criou a Creativa. Simples assim!",
  },
  {
    user: ["Ouvi dizer que tem a opção de ditado, mas não o vejo"],
    yuri: "É por conta que você desativou ou negou as permissões de acesso ao seu microfone, ou simplesmente seu navegador ou aparelho não tem suporte a essa função. Recomendo verificar isso nas configurações, atualizar a página ou o navegador, se der certo vai aparecer um botão azul de microfone ao lado esquerdo do botão de enviar.",
  },

  /* --- NOVO PASSO ADICIONADO (pedido seu) --- */
  {
    user: ["E esse botão de ideias?"],
    yuri: "Clicando nele você vê todos os tópicos que quiser, e clicando nos tópicos eu digo um tema aleatório e te ajudo a montar um roteiro! não é demais?",
  },
];

let tutorialIndex = 0;
const tutorialContent = document.getElementById("tutorialContent");
const nextBtn = document.getElementById("nextStepBtn");
const replayBtn = document.getElementById("replayTutorialBtn");
const tutorialSound = document.getElementById("tutorialSound");

function showStep(index) {
  tutorialContent.innerHTML = "";
  const step = tutorialSteps[index];
  step.user.forEach((u) => {
    const userDiv = document.createElement("div");
    userDiv.style.opacity = 0;
    userDiv.textContent = "Usuário: " + u;
    userDiv.style.margin = "8px 0";
    userDiv.style.transition = "opacity 0.5s";
    tutorialContent.appendChild(userDiv);
    setTimeout(() => {
      userDiv.style.opacity = 1;
    }, 100);
  });
  const yuriDiv = document.createElement("div");
  yuriDiv.style.opacity = 0;
  yuriDiv.style.margin = "12px 0";
  yuriDiv.innerHTML =
    "Yuri está digitando <span class='typing'></span><span class='typing'></span><span class='typing'></span>";
  tutorialContent.appendChild(yuriDiv);
  tutorialSound.currentTime = 0;
  tutorialSound.play();
  setTimeout(() => {
    yuriDiv.innerHTML = "Yuri: " + step.yuri;
    yuriDiv.style.transition = "opacity 0.5s";
    yuriDiv.style.opacity = 1;
    tutorialSound.currentTime = 0;
    tutorialSound.play();
  }, 1200);
}

document.getElementById("btnTutorial").onclick = () => {
  tutorialIndex = 0;
  replayBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  openModal("modalTutorial");
  showStep(tutorialIndex);
};
nextBtn.onclick = () => {
  tutorialIndex++;
  if (tutorialIndex >= tutorialSteps.length) {
    nextBtn.style.display = "none";
    replayBtn.style.display = "inline-block";
    tutorialContent.innerHTML =
      "<div>✨ Tutorial concluído! Use o chat à vontade! ✨</div>";
  } else {
    showStep(tutorialIndex);
  }
};
replayBtn.onclick = () => {
  tutorialIndex = 0;
  replayBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  showStep(tutorialIndex);
};
function openModal(id) {
  document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

/* ------------------------
   Créditos: abrir/fechar, reiniciar animação
   ------------------------*/
btnCreditos.addEventListener("click", () => {
  creditsModal.style.display = "flex";
  // reiniciar animação forçando reflow
  creditsRoll.style.animation = "none";
  void creditsRoll.offsetWidth;
  creditsRoll.style.animation = null; // animação volta ao definido no CSS
});

closeCreditsBtn.addEventListener("click", () => {
  creditsModal.style.display = "none";
});

creditsModal.addEventListener("click", (e) => {
  if (e.target === creditsModal) creditsModal.style.display = "none";
});

/* ------------------------
   Outros...
   ------------------------*/
