/* ============================================================
   GIGIÔ SEMIJOIAS — script.js
   ============================================================ */

// IDs de todas as grades de produto
var GRADES = [
    'grade-cgs-d',
    'grade-cgs-p',
    'grade-cgd-d',
    'grade-cgd-p',
    'grade-pgs-d',
    'grade-pgs-p',
    'grade-pgd-d',
    'grade-pgd-p'
];

// Imagens pré-definidas por grade (caminhos relativos ao HTML)
var IMAGENS = {
    'grade-cgd-d': [
        'imagens/duplas/correntes douradas/cr1.jpg',
        'imagens/duplas/correntes douradas/cr2.jpg',
        'imagens/duplas/correntes douradas/cr3.jpg',
        'imagens/duplas/correntes douradas/cr4.jpg',
        'imagens/duplas/correntes douradas/cr5.jpg',
        'imagens/duplas/correntes douradas/cr6.jpg'
    ],
    'grade-pgd-d': [
        'imagens/duplas/pulseiras douradas/pl1.jpg',
        'imagens/duplas/pulseiras douradas/pl2.jpg',
        'imagens/duplas/pulseiras douradas/pl3.jpg',
        'imagens/duplas/pulseiras douradas/pl4.jpg'
    ]
};

/* ----------------------------------------------------------
   Cria 6 slots de foto em cada grade
---------------------------------------------------------- */
function criarSlots() {

    GRADES.forEach(function (id) {

        var grade = document.getElementById(id);
        if (!grade) return;

        var imagensDaGrade = IMAGENS[id] || [];

        for (var i = 0; i < 6; i++) {

            var slot = document.createElement('div');
            slot.className = 'foto-slot';

            var srcPredefinido = imagensDaGrade[i] || null;

            if (srcPredefinido) {
                slot.innerHTML = '<img src="' + srcPredefinido + '" alt="Foto do produto">';
            } else {
                slot.innerHTML = [
                    '<svg viewBox="0 0 24 24" stroke-width="1" aria-hidden="true">',
                    '  <rect x="3" y="3" width="18" height="18" rx="2"/>',
                    '  <circle cx="8.5" cy="8.5" r="1.5"/>',
                    '  <polyline points="21 15 16 10 5 21"/>',
                    '</svg>',
                    '<span>Adicionar foto</span>',
                    '<input type="file" accept="image/*" aria-label="Adicionar foto do produto">'
                ].join('');

                var input = slot.querySelector('input');
                input.addEventListener('change', function (e) {
                    carregarImagem(e.target);
                });

                slot.addEventListener('click', function (e) {
                    if (e.target.tagName !== 'INPUT') {
                        this.querySelector('input').click();
                    }
                });
            }

            grade.appendChild(slot);
        }
    });
}

/* ----------------------------------------------------------
   Carrega imagem escolhida dentro do slot
---------------------------------------------------------- */
function carregarImagem(input) {

    var file = input.files[0];
    if (!file) return;

    var reader = new FileReader();

    reader.onload = function (e) {

        var slot = input.closest('.foto-slot, .maleta-slot');
        if (!slot) return;

        // Esconde ícone e texto
        slot.querySelectorAll('svg, span').forEach(function (el) {
            el.style.display = 'none';
        });

        // Cria ou atualiza a imagem
        var img = slot.querySelector('img');
        if (!img) {
            img = document.createElement('img');
            img.alt = 'Foto do produto';
            slot.appendChild(img);
        }
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

/* ----------------------------------------------------------
   Altera o número de colunas de uma grade
---------------------------------------------------------- */
function setCols(btn, gradeId, cols) {

    var grade = document.getElementById(gradeId);
    if (!grade) return;

    grade.setAttribute('data-cols', cols);
    grade.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';

    // Marca o botão ativo dentro do mesmo grupo
    var grupo = btn.closest('.col-controls');
    if (grupo) {
        grupo.querySelectorAll('.col-btn').forEach(function (b) {
            b.classList.remove('ativo');
        });
    }
    btn.classList.add('ativo');
}

/* ----------------------------------------------------------
   Slots clicáveis das maletas na seção de revendedoras
---------------------------------------------------------- */
function iniciarMaletas() {

    var maletas = document.querySelectorAll('.maleta-slot');

    maletas.forEach(function (slot) {

        var input = slot.querySelector('input[type="file"]');
        if (!input) return;

        input.addEventListener('change', function (e) {
            carregarImagem(e.target);
        });

        slot.addEventListener('click', function (e) {
            if (e.target.tagName !== 'INPUT') {
                input.click();
            }
        });
    });
}

/* ----------------------------------------------------------
   CARRINHO — estado
---------------------------------------------------------- */
var carrinho = [];

/* ----------------------------------------------------------
   Cria seletores de espessura/tamanho em cada seção
---------------------------------------------------------- */
function criarSelectors() {
    document.querySelectorAll('.colecao-section').forEach(function(secao) {
        var inner  = secao.querySelector('.colecao-inner');
        var titulo = secao.querySelector('.colecao-titulo');
        if (!inner || !titulo) return;

        var nomeProduto = titulo.textContent.trim();
        var isPulseira  = secao.id.indexOf('pulseira') !== -1;
        var preco       = isPulseira ? 649 : 989;

        var gradeEl = secao.querySelector('.foto-grid');
        var gradeId = gradeEl ? gradeEl.id : '';
        var temFoto = gradeId && IMAGENS[gradeId] && IMAGENS[gradeId].length > 0;

        var tamanhos = isPulseira
            ? ['18cm', '19cm', '20cm', '21cm', '22cm']
            : ['45cm', '50cm', '55cm', '60cm'];

        var tamanhosHtml = tamanhos.map(function(t) {
            return '<button class="selector-btn" data-valor="' + t + '">' + t + '</button>';
        }).join('');

        var selector = document.createElement('div');
        selector.className       = 'produto-selector';
        selector.dataset.produto = nomeProduto;
        selector.dataset.preco   = temFoto ? preco : 0;

        var footerHtml = temFoto
            ? '<div class="selector-footer">' +
                  '<span class="produto-preco-display">R$ ' + fmtPreco(preco) + '</span>' +
                  '<button class="btn-add-carrinho" disabled>Adicionar ao Carrinho</button>' +
              '</div>'
            : '';

        selector.innerHTML =
            '<div class="selector-row">' +
                '<div class="selector-grupo">' +
                    '<span class="selector-label">Espessura</span>' +
                    '<div class="selector-opcoes" data-grupo="espessura">' +
                        '<button class="selector-btn ativo" data-valor="8mm">8mm</button>' +
                    '</div>' +
                '</div>' +
                '<div class="selector-grupo">' +
                    '<span class="selector-label">Comprimento</span>' +
                    '<div class="selector-opcoes" data-grupo="tamanho">' +
                        tamanhosHtml +
                    '</div>' +
                '</div>' +
            '</div>' +
            footerHtml;

        inner.appendChild(selector);

        var tamBtns = selector.querySelectorAll('[data-grupo="tamanho"] .selector-btn');
        tamBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                tamBtns.forEach(function(b) { b.classList.remove('ativo'); });
                btn.classList.add('ativo');
                verificarSelecao(selector);
            });
        });

        if (temFoto) {
            selector.querySelector('.btn-add-carrinho').addEventListener('click', function() {
                adicionarAoCarrinho(selector);
            });
        }
    });
}

function verificarSelecao(selector) {
    var tamanho = selector.querySelector('[data-grupo="tamanho"] .selector-btn.ativo');
    selector.querySelector('.btn-add-carrinho').disabled = !tamanho;
}

/* ----------------------------------------------------------
   Adiciona item ao carrinho
---------------------------------------------------------- */
function adicionarAoCarrinho(selector) {
    var nome      = selector.dataset.produto;
    var preco     = parseFloat(selector.dataset.preco) || 0;
    var espessura = selector.querySelector('[data-grupo="espessura"] .selector-btn.ativo').dataset.valor;
    var tamanho   = selector.querySelector('[data-grupo="tamanho"] .selector-btn.ativo').dataset.valor;
    var chave     = nome + '|' + espessura + '|' + tamanho;

    var encontrado = false;
    for (var i = 0; i < carrinho.length; i++) {
        if (carrinho[i].chave === chave) {
            carrinho[i].quantidade++;
            encontrado = true;
            break;
        }
    }
    if (!encontrado) {
        carrinho.push({ chave: chave, nome: nome, espessura: espessura, tamanho: tamanho, preco: preco, quantidade: 1 });
    }

    renderizarCarrinho();
    abrirCarrinho();
}

/* ----------------------------------------------------------
   Renderiza o carrinho
---------------------------------------------------------- */
function renderizarCarrinho() {
    var lista   = document.getElementById('carrinho-lista');
    var vazio   = document.getElementById('carrinho-vazio');
    var totalEl = document.getElementById('carrinho-total');
    var badge   = document.getElementById('carrinho-badge');
    var btnWpp  = document.getElementById('btn-finalizar-wpp');

    lista.innerHTML = '';

    if (carrinho.length === 0) {
        vazio.style.display  = 'block';
        totalEl.textContent  = 'R$ 00,00';
        badge.textContent    = '0';
        badge.style.display  = 'none';
        btnWpp.removeAttribute('href');
        return;
    }

    vazio.style.display = 'none';

    var totalQtd   = 0;
    var totalValor = 0;

    carrinho.forEach(function(item, idx) {
        totalQtd   += item.quantidade;
        totalValor += item.preco * item.quantidade;

        var li = document.createElement('li');
        li.className = 'carrinho-item';
        li.innerHTML =
            '<div class="carrinho-item-info">' +
                '<span class="carrinho-item-nome">' + item.nome + '</span>' +
                '<span class="carrinho-item-detalhe">' + item.espessura + ' · ' + item.tamanho + '</span>' +
            '</div>' +
            '<div class="carrinho-item-acoes">' +
                '<button class="carrinho-qtd-btn" data-idx="' + idx + '" data-op="-">−</button>' +
                '<span class="carrinho-qtd">' + item.quantidade + '</span>' +
                '<button class="carrinho-qtd-btn" data-idx="' + idx + '" data-op="+">+</button>' +
                '<span class="carrinho-item-preco">R$ ' + fmtPreco(item.preco * item.quantidade) + '</span>' +
            '</div>';
        lista.appendChild(li);
    });

    lista.querySelectorAll('.carrinho-qtd-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var idx = parseInt(btn.dataset.idx);
            if (btn.dataset.op === '+') {
                carrinho[idx].quantidade++;
            } else {
                carrinho[idx].quantidade--;
                if (carrinho[idx].quantidade <= 0) carrinho.splice(idx, 1);
            }
            renderizarCarrinho();
        });
    });

    badge.textContent   = totalQtd;
    badge.style.display = 'flex';
    totalEl.textContent = 'R$ ' + fmtPreco(totalValor);

    var linhas = carrinho.map(function(item) {
        return item.quantidade + 'x ' + item.nome + ' (' + item.espessura + ', ' + item.tamanho + ')';
    }).join('%0A');
    var msg = 'Olá! Gostaria de fazer um pedido:%0A%0A' + linhas + '%0A%0ATotal: R$ ' + fmtPreco(totalValor);
    btnWpp.href = 'https://wa.me/5517997669007?text=' + msg;
}

function fmtPreco(v) {
    return v.toFixed(2).replace('.', ',');
}

function abrirCarrinho() {
    document.getElementById('carrinho-panel').classList.add('aberto');
    document.getElementById('carrinho-overlay').classList.add('ativo');
}

function fecharCarrinho() {
    document.getElementById('carrinho-panel').classList.remove('aberto');
    document.getElementById('carrinho-overlay').classList.remove('ativo');
}

/* ----------------------------------------------------------
   Inicializa tudo ao carregar a página
---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    criarSlots();
    iniciarMaletas();
    criarSelectors();

    document.getElementById('btn-abrir-carrinho').addEventListener('click', abrirCarrinho);
    document.getElementById('carrinho-fechar').addEventListener('click', fecharCarrinho);
    document.getElementById('carrinho-overlay').addEventListener('click', fecharCarrinho);
});
