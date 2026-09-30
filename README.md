# Financeiro via WhatsApp — Brudam (base segura)

Backend em Node.js/TypeScript para receber mensagens financeiras, interpretá-las **por regras** e exigir confirmação humana antes de qualquer sincronização. A primeira versão não usa OpenAI, Claude, Gemini nem API de IA paga.

## Subir localmente

1. Copie o ambiente: `cp .env.example .env` e troque `JWT_SECRET` por um segredo longo.
2. Execute: `docker compose up --build`.
3. Em outro terminal, crie schema e dados iniciais: `docker compose exec app npx prisma db push && docker compose exec app npm run prisma:seed`.
4. Abra `http://localhost:3000`. O health check está em `http://localhost:3000/health`.

> Para o primeiro administrador, defina `ADMIN_PHONE` (apenas dígitos, por exemplo `5511999999999`) e `ADMIN_PASSWORD` no ambiente antes do seed. Caso não defina, o seed cria o telefone `5500000000000` e senha `troque-esta-senha`; altere-a antes de qualquer uso real.

## Administrar cadastros

Entre no painel com o administrador. A API disponibiliza `POST /api/admin/users` (perfil `ADMIN`) para cadastrar funcionários, com `name`, `phone`, `password` e `role` (`ADMIN`, `OPERATOR`, `VIEWER`). Categorias iniciais são seedadas no banco, não no código: entradas (Frete, Serviço, Reembolso, Outros) e saídas (Combustível, Manutenção, Pedágio, Salários, Fornecedores, Impostos, Seguros, Despesas administrativas, Outros). Cadastros de veículos, clientes, fornecedores e contas estão modelados e têm endpoints de leitura; a gestão CRUD pode ser adicionada com a mesma proteção administrativa.

## Testar o fluxo sem WhatsApp

O adaptador local responde no log do contêiner. Poste um webhook usando o telefone de um usuário autorizado:

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp -H 'content-type: application/json' \
  -d '{"messageId":"entrada-1","from":"5511999999999","text":"/entrada 3500 frete cliente ABC"}'
# confirme somente após receber o resumo
curl -X POST http://localhost:3000/api/webhooks/whatsapp -H 'content-type: application/json' \
  -d '{"messageId":"entrada-2","from":"5511999999999","text":"1"}'
```

Para saída: envie `{"messageId":"saida-1","from":"5511999999999","text":"paguei 850 de manutenção do caminhão 32"}`. Para corrigir, envie `2` e depois `valor 900` (ou `categoria Combustível`, `veículo 15`, `data 2026-09-30`, `descrição ...`, `cliente ...`, `fornecedor ...`, `conta ...`); confirme com `1`. Para cancelar, envie `3` antes de confirmar. Mensagens incompletas ficam em sessão e o próximo texto complementa os campos extraídos.

## Segurança e comportamento

* Apenas telefones ativos em `users` são aceitos; funções internas requerem JWT e perfis.
* O `messageId` é idempotente para transações criadas, e cada transação tem `idempotencyKey`, logs de auditoria, criador, confirmador e horários.
* Valores são numéricos e a confirmação explícita (`1`) é indispensável. Não há chamada ao Brudam antes dela.
* Falha de sincronização preserva o lançamento como `PENDING_SYNC`; uma implementação de worker de retry deve reutilizar a chave de idempotência.

## WhatsApp e Brudam

`src/integrations/whatsapp/WhatsAppService.ts` é o único limite da integração WhatsApp. O projeto traz `ConsoleWhatsAppService` para desenvolvimento. Ao usar um provedor oficial, implemente esse contrato e mantenha tokens somente em variáveis de ambiente (`WHATSAPP_*`). O webhook aceita `from`, `text`, `messageId` e timestamp do provedor (o timestamp é reservado para o adaptador).

`src/integrations/brudam/BrudamService.ts` define `createTransaction`, `updateTransaction`, `getTransaction` e `cancelTransaction`. Em desenvolvimento, `BRUDAM_MODE=mock` usa o mock. **Não existem endpoints Brudam inventados**: só crie o adaptador real depois de receber a documentação oficial e configure URL/token em `BRUDAM_BASE_URL` e `BRUDAM_API_TOKEN`.

## IA local futura

`INTERPRETER=rules` é o padrão. `MessageInterpreter` permite trocar o `RuleBasedInterpreter` por `LocalAIInterpreter`; este último é intencionalmente um placeholder e deve chamar somente um Ollama/local configurado, validar JSON com Zod e nunca receber credenciais do Brudam. Mesmo com IA local, a sequência permanece interpretação → validação → confirmação humana → integração.
