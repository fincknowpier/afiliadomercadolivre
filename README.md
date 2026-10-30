# Radar de Ofertas — MVP Mercado Livre

Backend NestJS + PostgreSQL para monitorar produtos específicos e as categorias **Eletrônicos**, **Esportes e fitness** e **Casa e cozinha**. O MVP usa somente a API oficial do Mercado Livre; não há scraping.

## Estado da validação (28/10/2026, America/Sao_Paulo)

- `GET /sites/MLB/categories` sem token: **HTTP 403**.
- `GET /sites/MLB/search?q=notebook&limit=1` sem token: **HTTP 403**.
- Conclusão: acesso anônimo não foi autorizado. A integração ainda **não está validada**; é necessário criar uma aplicação, concluir OAuth 2.0 e executar a PoC com um token real.

## Abrir no VS Code conectado ao Codex

1. No VS Code, escolha **File > Open Folder…** e abra esta pasta.
2. Abra o painel do Codex e mantenha esta pasta como workspace.
3. No terminal integrado, rode `npm install`.
4. Copie `.env.example` para `.env` e preencha apenas credenciais obtidas oficialmente.

## Validar a API oficial primeiro

1. Crie uma aplicação no painel de desenvolvedores do Mercado Livre e configure uma Redirect URI exata.
2. Conclua o fluxo OAuth 2.0 Authorization Code. Nunca registre `client_secret`, access token ou refresh token no Git.
3. No terminal integrado, exporte o token somente para a sessão e execute:

```bash
ML_ACCESS_TOKEN='seu-token' npm run poc:ml
```

A PoC chama `/users/me` e faz uma busca amostral. Só a saída `status: VALIDADO` confirma acesso. Erros 401/403 mantêm a integração bloqueada.

### Fluxo OAuth da aplicação

Configure `ML_CLIENT_SECRET` somente no ambiente do servidor. Com a API publicada, acesse:

```text
https://radar-promocoes-api.onrender.com/auth/mercadolivre/start
```

Abra a `authorizationUrl` retornada. O callback valida `state`, usa PKCE S256, troca o código por tokens no backend e confirma a conta em `/users/me`. Nesta fase os tokens ainda não são persistidos; o monitoramento automático só será habilitado após armazenamento criptografado.

Documentação oficial: [autenticação OAuth](https://developers.mercadolivre.com.br/autenticacao-e-autorizacao) e [itens e buscas](https://developers.mercadolivre.com.br/itens-e-buscas).

## Rodar a base local

```bash
docker compose up -d
cp .env.example .env
npm run start:dev
```

Saúde da aplicação: `http://localhost:3000/health`.

## Publicar no Render

O `render.yaml` cria a API e o PostgreSQL; o `Dockerfile` gera a imagem de produção. Na criação do Blueprint, informe `ML_CLIENT_SECRET` no painel do Render — nunca no arquivo ou no Git.

Depois do primeiro deploy:

1. Confirme que `https://SEU-SERVICO.onrender.com/health` responde com `status: ok`.
2. Use `https://radar-promocoes-api.onrender.com` como domínio oficial do MVP.
3. Cadastre exatamente `https://radar-promocoes-api.onrender.com/auth/mercadolivre/callback` como Redirect URI no Mercado Livre.
4. Abra `/auth/mercadolivre/start` pelo domínio do Render.

## Regras iniciais

- desconto mínimo: 15% sobre a média histórica observada pelo próprio sistema;
- preço máximo: R$ 1.000;
- avaliação mínima: 4,5;
- frequência: a cada 3 horas;
- links de afiliado: inseridos manualmente;
- Telegram: privado e desativado até validar bot e chat.

Nota: `original_price` do anúncio não é tratado como média histórica. A média será calculada pelos snapshots salvos em `price_snapshots` após haver amostra suficiente.

## Próximas etapas após OAuth validado

1. Confirmar quais campos de avaliação estão disponíveis nos endpoints autorizados.
2. Resolver IDs oficiais das três categorias no site MLB.
3. Implementar coletores para item e categoria, com limites e tratamento de rate limit.
4. Salvar snapshots e definir janela mínima da média histórica.
5. Habilitar alertas no Telegram privado e anexar o link de afiliado manual.
