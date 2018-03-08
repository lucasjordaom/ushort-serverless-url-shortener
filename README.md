![U Short](https://raw.githubusercontent.com/lucasjordaoeou/serverless-url-shortener/master/docs/images/u-short-capa-768x418.png)

# Serverless URL Shortener

Esse projeto, inspirado em um [post](https://aws.amazon.com/blogs/compute/build-a-serverless-private-url-shortener/) do Stephan Hadinger, um arquiteto de soluções na Amazon é a viabilização de um encurtador de URLs totalmente escalável e serverless.


# O projeto original
### Stephan Hadinger: 
“Como um arquiteto de soluções, muitas vezes eu preciso enviar arquivos grandes para clientes, como diagramas de arquitetura e apresentações. Para evitar o envio de anexos pesados no e-mail, eu primeiro envio o conteúdo para o Amazon S3 e, em seguida, envio o URL para permitir que o cliente transfira o conteúdo com segurança. No entanto, os URLs do S3 geralmente são mais de 250 caracteres e podem quebrar em várias linhas nos leitores de e-mail. É mais conveniente e fácil usar um encurtador de URLs. Como esse conteúdo geralmente é confidencial, evito o uso de serviços públicos de encurtamento de URLs. Foi quando percebi que era super fácil construir um privado.”
=====
A imagem a seguir mostra a página de administração.

![U Short](https://raw.githubusercontent.com/lucasjordaoeou/serverless-url-shortener/master/docs/images/urlshortener_admin-300x198.png)

Este mostra um URL curto gerado pronto para copiar e colar.

![U Short](https://raw.githubusercontent.com/lucasjordaoeou/serverless-url-shortener/master/docs/images/urlshortener_url.png)

## Usando o mecanismo de redirecionamento

É uma característica pouco conhecida: o S3 pode atuar como um mecanismo de redirecionamento.

Primeiro, você precisa ativar o “hospedagem de sites” no seu bucket S3. Em seguida, você cria um objeto vazio para cada URL curto (uma ID aleatória de 5 caracteres) e anexa os metadados do “redirecionamento do site” com o URL alvo (longo). Quando o usuário atinge o URL curto, o S3 responde automaticamente com um redirecionamento HTTP para o URL alvo (longo), sem que você precise de nenhum código. Para obter mais informações, consulte [Configurando um redirecionamento da página da Web.](https://docs.aws.amazon.com/AmazonS3/latest/dev/how-to-page-redirect.html)

Para evitar a proliferação desses objetos de redirecionamento, você pode habilitar uma política de ciclo de vida para excluir objetos automaticamente, por exemplo, após 7 dias.

## Criando uma página de administração

Para criar objetos de redirecionamento, você precisa de uma página de administração simples: uma página HTML estática hospedada em S3 e construída com [jquery](https://jquery.com/). Quando você escolhe Shorten, ele dispara uma solicitação POST para API Gateway, que invoca com segurança uma função Lambda (~ 70 linhas de código) depois de validar todos os parâmetros. O código em Lambda simplesmente armazena um objeto vazio em S3 com um nome aleatório de 7 caracteres e atribui os metadados para o redirecionamento HTTP.

## Usando o Amazon CloudFront para conectar todas as partes

Para evitar a configuração do CORS e ter um nome de domínio simples e amigável, envolva todas as peças por trás de uma única distribuição do Amazon CloudFront, conforme mostrado no diagrama abaixo. Existem três ações CloudFront:

- Todos os pedidos para o prefixo “/admin/” servem arquivos HTML estáticos a partir do S3.
- Todos os pedidos para o prefixo “/prod/” são enviados para o Gateway da API.
- Todos os outros pedidos são enviados a partir de S3 de uma pasta específica chamada “u” que armazena todos os objetos de redirecionamento.

Diagrama original do processo:

![U Short](https://raw.githubusercontent.com/lucasjordaoeou/serverless-url-shortener/master/docs/images/diagrama-antigo.png)

## Considerações sobre arquitetura e custos

Usar uma aplicação serverless completa tem vários benefícios: o aplicativo é nativo multi-AZ e escala automaticamente se você tem uma requisição por mês ou dez por segundo.

Agora, avalie o custo do encurtador de URL para um cenário simples: você cria 1000 URLs curtas por mês e cada um é visualizado por 1000 usuários – ou seja, 1 milhão de requisições por mês. Aqui está uma estimativa de custo para a região do Oregon dividida pelos serviços:

- Lambda: 1000 invocações cada uma menos de 1 segundo – menos de $ 0.003 / mês
- API Gateway: 1000 chamadas API – menos de $ 0.004 / mês
- S3: o custo de armazenamento é insignificante, o custo de 1 milhão de GET é de US $ 0,04 / mês
- Amazon CloudFront: o custo da banda é insignificante, o custo de 1 milhão GET é de US $ 0,075 / mês

O custo total é **inferior a 12 centavos por mês**.

## Integração com ferramentas de automação de marketing *Mautic*

Modificamos as chamadas da API, e alem de POST que retorna um Json com os dados, criamos uma função lambda que retorna um *text/plain* ao ser chamado via GET no API Gateway, possibilitando a utilização na ferramenta de automação de marketing [Mautic](https://www.mautic.org/).

Diagrama customizado do processo:

![U Short](https://raw.githubusercontent.com/lucasjordaoeou/serverless-url-shortener/master/docs/images/diagrama-custom.png)

=====

This repo contains components for a proof of concept URL shortner service running on Amazon's API Gateway and Lambda services.

Related blog post: [Build a Serverless, Private URL Shortener](https://aws.amazon.com/pt/blogs/compute/build-a-serverless-private-url-shortener/)

## Components

* API Gateway front-end
* Lambda JavaScript function back-end
* S3 to store the redirect objects

### Required AWS resources

Soon

### API Gateway

Soon

### Lambda Functions

Soon

**NOTE**: Soon.



```
Soon
```

