import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyBl6CcTHU42IFBsQjrFkQxOW2yRekH8muQ",
  authDomain: "cardapiodigital-9ef11.firebaseapp.com",
  projectId: "cardapiodigital-9ef11",
  storageBucket: "cardapiodigital-9ef11.firebasestorage.app",
  messagingSenderId: "926971158968",
  appId: "1:926971158968:web:993662b801af84273faf4d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let carrinho = [];
let total = 0;

function adicionarAoCarrinho(nome, preco) {
  console.log(`Adicionando ao carrinho: ${nome}, R$ ${preco}`);
  const itemExistente = carrinho.find(item => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade += 1;
    itemExistente.subtotal += preco;
  } else {
    carrinho.push({
      nome,
      preco,
      quantidade: 1,
      subtotal: preco
    });
  }

  total += preco;
  atualizarCarrinho();
  exibirNotificacao(nome);
}

function removerDoCarrinho(index) {
  const item = carrinho[index];
  total -= item.subtotal;
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const carrinhoItens = document.getElementById('carrinho-itens');
  carrinhoItens.innerHTML = '';

  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = '<p class="text-gray-300">Nenhum item no carrinho.</p>';
  } else {
    carrinho.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center py-2 border-b';
      div.innerHTML = `
        <div class="flex-1">
          <span>${item.nome} x${item.quantidade}</span> - <span>R$ ${item.subtotal.toFixed(2)}</span>
        </div>
        <button class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 ml-4" onclick="removerDoCarrinho(${index})">Remover</button>
      `;
      carrinhoItens.appendChild(div);
    });
  }

  document.getElementById('total').textContent = total.toFixed(2);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

document.getElementById('orderForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const paymentMethod = document.getElementById('paymentMethod').value;
  const changeNeeded = document.getElementById('changeNeeded').value.trim();

  // Validações
  if (!name || !phone || !address || !paymentMethod) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

 const phoneRegex = /^(\(?\d{2}\)?[\s.-]?)?\d{4,5}[-.\s]?\d{4}$/;
if (!phoneRegex.test(phone)) {
  alert('Por favor, insira um telefone válido.');
  return;
}


  if (address.length < 10) {
    alert('Por favor, insira um endereço válido com pelo menos 10 caracteres.');
    return;
  }

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Confirmação do pedido
  const confirmacao = confirm(`Confirme seu pedido:\n\nNome: ${name}\nTelefone: ${phone}\nEndereço: ${address}\nTotal: R$ ${total.toFixed(2)}\n\nDeseja enviar?`);
  if (!confirmacao) return;

  // Envio ao Firestore
  try {
    console.log('Enviando pedido:', { name, phone, address, items: carrinho, total });
    await addDoc(collection(db, 'orders'), {
      name,
      phone,
      address,
      paymentMethod,
      changeNeeded,
      items: carrinho.map(item => ({
        nome: item.nome,
        quantidade: item.quantidade,
        subtotal: item.subtotal
      })),
      total,
      status: 'pendente',
      createdAt: serverTimestamp()
    });
    console.log('Pedido salvo com sucesso no Firestore!');
    alert('Pedido enviado com sucesso! Redirecionando para o WhatsApp.');

    // Envio para WhatsApp
    let mensagem = `Olá! Gostaria de fazer um pedido:\n\n`;
    mensagem += `Nome: ${name}\n`;
    mensagem += `Telefone: ${phone}\n`;
    mensagem += `Endereço: ${address}\n`;
    mensagem += `Forma de pagamento: ${paymentMethod}\n`;
    mensagem += `Precisa de troco? ${changeNeeded || 'Não'}\n\n`;
    carrinho.forEach(item => {
      mensagem += `- ${item.nome} x${item.quantidade} - R$ ${item.subtotal.toFixed(2)}\n`;
    });
    mensagem += `\nTotal: R$ ${total.toFixed(2)}`;

    const numeroWhatsApp = '5517996043167';
    const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    window.open(linkWhatsApp, '_blank');

    // Limpar carrinho e formulário
    carrinho = [];
    total = 0;
    atualizarCarrinho();
    document.getElementById('orderForm').reset();
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    if (error.code === 'permission-denied') {
      alert('Permissão negada. Verifique as regras do Firestore no Firebase Console.');
    } else {
      alert(`Erro ao salvar o pedido: ${error.message}`);
    }
  }
});

function exibirNotificacao(nome) {
  const notificacao = document.createElement('div');
  notificacao.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
  notificacao.textContent = `${nome} adicionado ao carrinho!`;
  document.body.appendChild(notificacao);
  setTimeout(() => notificacao.remove(), 3000);
}

function toggleCustomBurgerForm() {
  const form = document.getElementById('customBurgerForm');
  form.classList.toggle('hidden');
}

function addCustomBurger() {
  const burgerType = document.getElementById('burgerType').value.split('|');
  const toppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked')).map(input => input.value.split('|'));
  const sauce = document.getElementById('sauce').value.split('|');
  const bread = document.getElementById('bread').value.split('|');

  if (toppings.length > 5) {
    alert('Por favor, selecione no máximo 5 ingredientes!');
    return;
  }

  let preco = parseFloat(burgerType[1]) + parseFloat(sauce[1]) + parseFloat(bread[1]);
  const ingredientes = [burgerType[0], sauce[0], bread[0]];
  toppings.forEach(topping => {
    preco += parseFloat(topping[1]);
    ingredientes.push(topping[0]);
  });

  const nome = `Hambúrguer Personalizado (${ingredientes.join(', ')})`;
  adicionarAoCarrinho(nome, preco);
  toggleCustomBurgerForm();
}

function toggleBebidaModal() {
  const modal = document.getElementById('modalBebida');
  modal.classList.toggle('hidden');
}

function adicionarBebida() {
  const sabores = document.getElementsByName('saborBebida');
  let selecionado = null;
  for (const sabor of sabores) {
    if (sabor.checked) {
      selecionado = sabor.value;
      break;
    }
  }

  if (!selecionado) {
    alert('Por favor, selecione um sabor de refrigerante.');
    return;
  }

  adicionarAoCarrinho(`Refrigerante (${selecionado})`, 7.00);
  toggleBebidaModal();
}

function toggleMilkshakeModal() {
  document.getElementById('modalMilkshake').classList.toggle('hidden');
}

function adicionarMilkshake() {
  const sabores = document.getElementsByName('saborMilkshake');
  let selecionado = null;
  for (const s of sabores) {
    if (s.checked) {
      selecionado = s.value;
      break;
    }
  }

  if (!selecionado) {
    alert('Por favor, selecione um sabor de milkshake.');
    return;
  }

  adicionarAoCarrinho(`Milkshake (${selecionado})`, 20.00);
  toggleMilkshakeModal();
}

function toggleSucoModal() {
  document.getElementById('modalSuco').classList.toggle('hidden');
}

function adicionarSuco() {
  const sabores = document.getElementsByName('saborSuco');
  let selecionado = null;
  for (const s of sabores) {
    if (s.checked) {
      selecionado = s.value;
      break;
    }
  }

  if (!selecionado) {
    alert('Por favor, selecione um sabor de suco.');
    return;
  }

  adicionarAoCarrinho(`Suco Natural (${selecionado})`, 10.00);
  toggleSucoModal();
}

const carrinhoSalvo = JSON.parse(localStorage.getItem('carrinho'));
if (carrinhoSalvo) {
  carrinho = carrinhoSalvo;
  total = carrinho.reduce((sum, item) => sum + item.subtotal, 0);
  atualizarCarrinho();
}

let deferredPrompt;
const installButton = document.getElementById('install-button');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installButton.style.display = 'block';
});

installButton.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(outcome === 'accepted' ? 'Usuário aceitou a instalação' : 'Usuário recusou a instalação');
    deferredPrompt = null;
    installButton.style.display = 'none';
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalado com sucesso');
  installButton.style.display = 'none';
});

// Expor funções no escopo global
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.removerDoCarrinho = removerDoCarrinho;
window.toggleCustomBurgerForm = toggleCustomBurgerForm;
window.addCustomBurger = addCustomBurger;
window.toggleBebidaModal = toggleBebidaModal;
window.adicionarBebida = adicionarBebida;
window.toggleMilkshakeModal = toggleMilkshakeModal;
window.adicionarMilkshake = adicionarMilkshake;
window.toggleSucoModal = toggleSucoModal;
window.adicionarSuco = adicionarSuco;