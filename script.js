
let carrinho = [];
let total = 0;

function adicionarAoCarrinho(nome, preco) {
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
}
document.getElementById('orderForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Captura os dados do formulário de cliente
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const paymentMethod = document.getElementById('paymentMethod').value;
  const changeNeeded = document.getElementById('changeNeeded').value;

  // Verifica se todos os campos obrigatórios foram preenchidos
  if (!name || !phone || !address || !paymentMethod) {
    alert('Por favor, preencha todos os campos obrigatórios!');
    return;
  }

  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Monta a mensagem do pedido com as informações do cliente
  let mensagem = `Olá! Gostaria de fazer um pedido:\n\n`;  // Usando '\n' para quebras de linha
  mensagem += `Nome: ${name}\n`;
  mensagem += `Telefone: ${phone}\n`;
  mensagem += `Endereço: ${address}\n`;
  mensagem += `Forma de pagamento: ${paymentMethod}\n`;
  mensagem += `Precisa de troco? ${changeNeeded ? changeNeeded : 'Não'}\n\n`;

  // Adiciona os itens do carrinho na mensagem
  carrinho.forEach(item => {
    mensagem += `- ${item.nome} x${item.quantidade} - R$ ${item.subtotal.toFixed(2)}\n`;
  });

  // Adiciona o total na mensagem
  mensagem += `\nTotal: R$ ${total.toFixed(2)}`;

  // Número do WhatsApp (ajuste conforme necessário)
  const numeroWhatsApp = '5517996043167';
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

  // Alerta para o usuário (pode ser removido se preferir)
  alert('Redirecionando para o WhatsApp com seu pedido!');

  // Redireciona para o WhatsApp
  window.open(linkWhatsApp, '_blank');

  // Limpa carrinho e total após o envio
  carrinho = [];
  total = 0;
  atualizarCarrinho();
});

