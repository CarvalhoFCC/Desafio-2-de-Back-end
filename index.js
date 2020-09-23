const koa = require('koa');
const bodyparser = require('koa-bodyparser');

const server = new koa();

server.use(bodyparser());

const respostaDeSucesso = (entidade) => {
    const resposta = {
        status: 'sucesso',
        dados: entidade,
    };
    
    return resposta;
};

const respostaDeErro = (mensagem, codigo, ctx) => {
    const resposta = {
        status:  'erro',
            dados: {
                mensagem: mensagem // descrever o erro
            }
    };

    ctx.status = codigo;
    ctx.body = resposta;
};

const produto = [
    {
        id: 1,
        nome: "camisa",
        quantidade: 5,
        valor: 5,
        deletado: false,
    },
    {
        id: 2,
        nome: "bermuda",
        quantidade: 3,
        valor: 10,
        deletado: false,
    }
];

const criarNovoProduto = (ctx) => {
    const nomeProduto = ctx.request.body.nome;
    const valorProduto = ctx.request.body.valor;
    const quantidadeProduto = ctx.request.body.quantidade;
    
    const novoProduto = {
        id: (produto.length === 0) ? id = 1 : id = produto[produto.length-1].id + 1,
        nome: (nomeProduto) ? nomeProduto : "Produto sem nome",
        quantidade: (quantidadeProduto) ? Number(quantidadeProduto) : null,
        valor: (valorProduto) ? Number(valorProduto) : null,
        deletado: false,
    }

    produto.push(novoProduto);

    return novoProduto;
};

const listarProduto = () => {
    const produtoAtivos = [];

    produto.forEach((item) => {
        if(!item.deletado) produtoAtivos.push(item);
    });

    return produtoAtivos;
};

const buscarProduto = (quebraDeCaminho, produto) => {
    const id = Number(quebraDeCaminho[2]);

    if (id) {
        for (const item of produto) {
            if (item.id === id && item.deletado === false) {
                return item;
            }
        }
    }

    return false;
};

const deletarProduto = (quebraDeCaminho, produto) => {
    const id = Number(quebraDeCaminho[2]);
    
    for (let i = 0; i < produto.length; i++) {
        if (id === produto[i].id /*&& produto[i].deletado === false*/) {
            produto[i].deletado = true;
            return produto[i];
        }
    };

};

const atualizarProduto = (quebraDeCaminho, produto, ctx) => {
    const id = Number(quebraDeCaminho[2]);

    const nomeProduto = ctx.request.body.nome;
    const valorProduto = ctx.request.body.valor;
    const quantidadeProduto = ctx.request.body.quantidade;

    if (id) {
        for (let i = 0; i < produto.length; i++) {
            if (produto[i].id === id && produto[i].deletado === false) {
                if (nomeProduto) produto[i].nome = nomeProduto
                if (valorProduto) produto[i].valor = Number(valorProduto)
                if (quantidadeProduto) produto[i].quantidade = Number(quantidadeProduto)

                return produto[i];
            }
        }
    }    
};

// PEDIDOS



const pedidos = [];

const adicionarPedido = () => {
    const novoPedido = {
        id: (pedidos.length === 0) ? id = 1 : id = pedidos[pedidos.length-1].id + 1,
        produtos: [],
        estado: "incompleto",    /*   incompleto, processando, pago, enviado, entregue ou cancelado   */
        idCliente: "",
        deletado: false,
        valorTotal: 0,
    };

    pedidos.push(novoPedido);

    return novoPedido;
};

const listarPedidos = () => {
    const pedidosAtivos = [];

    for (const item of pedidos) {
        if (!item.deletado) pedidosAtivos.push(item);
    };

    return pedidosAtivos;
};

const buscarPedido = (quebraDeCaminho, pedidos) => {
    const id = Number(quebraDeCaminho[2]);

    if (id) {
        for (const item of pedidos) {
            if (item.id === id && item.deletado === false) {
                return item;
            }
        }
    }

    return false;
};

const deletarPedido = (quebraDeCaminho, pedidos) => {
    const id = Number(quebraDeCaminho[2]);
    
    for (let i = 0; i < pedidos.length; i++) {
        if (id === pedidos[i].id /*&& produto[i].deletado === false*/) {
            pedidos[i].deletado = true;
            return pedidos[i];
        }
    };

};

const atualizarProdutoNoCarrinho = (pedidos, produto, quebraDeCaminho, ctx) => {
    const idPedido = quebraDeCaminho[2];
    const idProduto = ctx.request.body.idProduto;
    const quantidade = ctx.request.body.quantidade;
    const acao = ctx.request.body.acao;
    // const valorTotal = quantidade * produto[idProduto].valor;
    const produtosDoPedido = pedidos[idPedido -1].produtos
    let verificacao = false, local;

                    // TEM O (ADICIONAR E REMOVER) PARA SABER SE ESTÁ AUMENTANDO OU REDUZINDO, MAS ELE SÓ ALTERA O VALOR DA QUANTIDADE! 
    const produtoAtualizado = {
        id: idProduto,
        nome: produto[idProduto - 1].nome,
        quantidade: quantidade,
        valor: produto[idProduto - 1].valor,
        deletado: produto[idProduto - 1].deletado,
    }
    
    if (produtosDoPedido.length > 0) {
        for (let i = 0; i < produtosDoPedido.length; i++) {
            if ( produtosDoPedido[i].id === idProduto) {
                verificacao = true;
                local = i;
            }
        }
                        // PRODUTO JÁ ESTÁ NA LISTA
        if (verificacao === true) { // CASO TENHA A QUANTIDADDE NO ESTOQUE
            if (acao === "adicionar" && pedidos[idPedido -1].estado === "incompleto") {
                if (produto[idProduto - 1].quantidade >= produtoAtualizado.quantidade && produto[idProduto - 1].deletado === false) {
                    
                    produto[idProduto -1].quantidade -= produtoAtualizado.quantidade;
                    produtosDoPedido[local].quantidade = produtoAtualizado.quantidade;

                    return produtoAtualizado;
                }
            }

            if (acao === "remover" && pedidos[idPedido -1].estado === "incompleto") {
                let verificarMaiorQueZero = produtosDoPedido[local].quantidade - quantidade;

                if (verificarMaiorQueZero >= 0) {
                    produto[idPedido -1].quantidade += quantidade;

                    produtosDoPedido[local].quantidade = quantidade;
                }
            }



                                //PRODUTO NÃO ESTÁ NA LISTA
        }else {         //  PEDIDO VAZIO
            if (acao === "adicionar" && pedidos[idPedido -1].estado === "incompleto" ) { // CASO TENHA A QUANTIDADDE NO ESTOQUE
                if (produto[idProduto - 1].quantidade >= produtoAtualizado.quantidade && produto[idProduto - 1].deletado === false) {
                    
                    produto[idProduto -1].quantidade -= produtoAtualizado.quantidade;
                    produtosDoPedido.push(produtoAtualizado);
    
                    return produtoAtualizado;
                }
            }
        }
    }
    
    else {         //  PEDIDO VAZIO
        if (acao === "adicionar" && pedidos[idPedido -1].estado === "incompleto") { // CASO TENHA A QUANTIDADDE NO ESTOQUE
            if (produto[idProduto - 1].quantidade >= produtoAtualizado.quantidade && produto[idProduto - 1].deletado === false) {
                
                produto[idProduto -1].quantidade -= produtoAtualizado.quantidade;
                produtosDoPedido.push(produtoAtualizado);

                return produtoAtualizado;
            }
        }
    }
};

const atualizarEstadoDoPedido = (pedidos, quebraDeCaminho, ctx) => {
    let idPedido = Number(quebraDeCaminho[2]);
    const novoEstatus = ctx.query.estado;

    for (let i = 0; i < pedidos.length; i++) {
        if (idPedido === pedidos[i].id) {
            pedidos[i].estado = novoEstatus;
            console.log("ok");
            
            return pedidos[i];
        }
    };
};

server.use((ctx) => {
    const path = ctx.url;
    const method = ctx.method;
    const quebraDeCaminho = path.split("/");

    if (path === "/products") {
        if (method === "GET") {   /*   Obter todos os produto	GET /products   */

            ctx.body = respostaDeSucesso(listarProduto());

        }else if (method === "POST"){      /* CRIAR NOVO PRODUTO  POST /products */

            ctx.body = respostaDeSucesso(criarNovoProduto(ctx));

        }else {

            respostaDeErro("Requisição mal formatada!", 400, ctx)

        }
    }else if (path.includes("/products/")) {

        if (method === "GET") {    /* Obter informações de um produto	GET /products/:id */
            if (buscarProduto(quebraDeCaminho, produto) && quebraDeCaminho.length === 3) {
                ctx.body = respostaDeSucesso(buscarProduto(quebraDeCaminho, produto));
            }else if (quebraDeCaminho.length >= 4) {
                respostaDeErro("Requisição mal formatada!", 400, ctx);
            }else {
                respostaDeErro("Produto não encontrado", 404, ctx); 
            }
            
        }

        if (method === "DELETE") {   /*   Deletar um produto	DELETE /products/:id       FALTA UM DETALHE DE DELETAR PRODUTO JÁ DELETADOS   */
            if (deletarProduto(quebraDeCaminho, produto) && quebraDeCaminho.length === 3) {
            //    console.log(deletarProduto(quebraDeCaminho, produto));

                ctx.body = respostaDeSucesso(deletarProduto(quebraDeCaminho, produto));

            }else if (quebraDeCaminho.length >= 4) {
                respostaDeErro("Requisição mal formatada!", 400, ctx);
            }else {
                respostaDeErro("Produto não encontrado", 404, ctx);
            }
        }

        if (method === "PUT") {   /*   Atualizar um produto	PUT /products/:id   */
            
            ctx.body = respostaDeSucesso(atualizarProduto(quebraDeCaminho, produto, ctx));

            if (atualizarProduto(quebraDeCaminho, produto, ctx) && quebraDeCaminho.length === 3) {
                ctx.body = respostaDeSucesso(atualizarProduto(quebraDeCaminho, produto, ctx));
                
            }else if (quebraDeCaminho.length >= 4) {
                respostaDeErro("Requisição mal formatada!", 400, ctx);
            }else {
                respostaDeErro("Produto não encontrado", 404, ctx);
            }
        }
    
    }else if (path === "/orders") {
        if (method === "POST") {     /*   Criar um novo pedido      POST /orders     */

            ctx.body = respostaDeSucesso(adicionarPedido());

        }else if (method === "GET") {     /*   Obter todos os pedidos        GET /order     */
            ctx.body = respostaDeSucesso(listarPedidos());
        }else respostaDeErro("Requisição mal formatada!", 400, ctx);
        
    }else if (path.includes("/orders/")) {
        
        if (method === "GET") {     /*   Obter informações de um pedido em particular      GET `/orders/:id     */
            if (buscarPedido(quebraDeCaminho, pedidos) && quebraDeCaminho.length === 3) {
                ctx.body = respostaDeSucesso(buscarPedido(quebraDeCaminho, pedidos));
            }else if (quebraDeCaminho.length >= 4) {
                respostaDeErro("Requisição mal formatada!", 400, ctx);
            }else {
                respostaDeErro("Produto não encontrado", 404, ctx); 
            }
        }else if (method === "DELETE") {     /*   Deletar um pedido        DELETE `/orders/:id     */
            if (deletarPedido(quebraDeCaminho, pedidos) && quebraDeCaminho.length === 3) {
            //    console.log(deletarProduto(quebraDeCaminho, produto));

                ctx.body = respostaDeSucesso(deletarPedido(quebraDeCaminho, pedidos));

            }else if (quebraDeCaminho.length >= 4) {
                respostaDeErro("Requisição mal formatada!", 400, ctx);
            }else {
                respostaDeErro("Produto não encontrado", 404, ctx);
            }
        }else if (method === "PUT" && quebraDeCaminho.length === 3) {
            ctx.body = atualizarProdutoNoCarrinho(pedidos, produto, quebraDeCaminho, ctx);
        }else if ((method === "PUT" && quebraDeCaminho.length === 4)) {
            ctx.body = atualizarEstadoDoPedido(pedidos, quebraDeCaminho, ctx);
        } 
        

    }else respostaDeErro("Requisição mal formatada!", 400, ctx);



});

server.listen(8081, () => console.log("Servidor rodando!"))