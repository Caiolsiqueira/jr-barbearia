# J&R Barbearia - Juliano & Robert 💈

Aplicação Web responsiva (**Mobile-First / PWA-ready**) voltada para agendamento online e gestão financeira/operacional de barbearia para dois profissionais autônomos e independentes: **Juliano** e **Robert**.

---

## 🎨 1. Identidade Visual & Paleta de Cores
A interface adota um tema escuro sofisticado e clean com alto contraste e ergonomia tátil:
- **Cor de Fundo Principal / Superfícies escuras:** `#191d0e`
- **Cor Secundária / Destaques profundos:** `#044000`
- **Cor de Acento / Ícones e Detalhes:** `#008894`
- **Texto Principal / Contraste:** `#eae5d8`
- **Cor de Destaque / Ação / Botões (CTA):** `#A8EB12` (com texto contrastante para acessibilidade)

---

## 🚀 2. Como Executar Localmente

### Opção 1: Via Servidor Python Integrado
Como o projeto é construído em padrões web modernos puros (HTML5, CSS3, ES6 JavaScript, PWA), não é necessário instalar Node ou npm:

```bash
cd c:\Users\Usuario\Documents\Doc_Py\Codigos\jr_barbearia
python server.py
```
Abra no seu navegador: **`http://localhost:8000`** (ou acesse diretamente pelo celular na mesma rede local Wi-Fi).

### Opção 2: Abrir Diretamente
Você também pode abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Edge, Safari, Firefox).

---

## 🔐 3. Credenciais de Acesso ao Painel Administrativo (`/admin` ou aba "Área do Barbeiro")

Cada profissional possui sua credencial própria com **isolamento estrito de dados** (Juliano não vê agendamentos, clientes ou faturamento de Robert, e vice-versa):

| Barbeiro | Usuário | Senha | Preço Cabelo Padrão | Preço Barba Padrão | WhatsApp de Confirmação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Juliano** | `juliano` | `juliano123` | R$ 35,00 | R$ 20,00 | `(32) 98456-1005` |
| **Robert** | `robert` | `robert123` | R$ 35,00 | R$ 20,00 | `(32) 98456-1005` |

*Dica: Na tela de login existem botões de preenchimento em 1 clique para agilizar seus testes.*
*WhatsApp Oficial de Confirmação:* **`(32) 98456-1005`** (`32984561005`).

---

## 🗄️ 4. Integração com Supabase (PostgreSQL)

O projeto opera em **Modo Híbrido Inteligente**:
1. **Modo Zero Config (Mock Local Storage):** Já vem pré-carregado com Juliano, Robert e histórico de agendamentos para você testar gráficos, métricas e agendamentos imediatamente sem nenhuma configuração externa.
2. **Modo Supabase Cloud:** Para conectar sua própria base PostgreSQL no Supabase:
   - Abra o painel do seu projeto no [Supabase](https://supabase.com).
   - Vá no **SQL Editor** e execute o script `supabase/schema.sql` (cria tabelas, triggers e RLS).
   - Opcionalmente execute `supabase/seed.sql` para popular dados de demonstração.
   - Na aplicação web, clique no ícone de engrenagem ⚙️ no cabeçalho superior direito e insira sua **URL do Projeto** e **Anon Public Key**.

---

## 📱 5. Recursos e Fluxo do Usuário

### Fluxo do Cliente (Página Pública)
1. **Dados de Contato:** Nome completo e WhatsApp com máscara automática `(XX) XXXXX-XXXX`.
2. **Escolha de Barbeiro:** Cards dinâmicos de Juliano e Robert com fotos e especialidades.
3. **Seleção de Serviço:**
   - Corte de Cabelo (R$ 35,00 - padrão, 30 min)
   - Apenas Barba (R$ 20,00, 30 min)
   - Cabelo e Barba (R$ 55,00, 30 min)
   - *Nota:* Os preços atualizam dinamicamente de acordo com a tabela configurada pelo barbeiro escolhido!
4. **Seleção de Data:**
   - **Domingo e Segunda-feira bloqueados** (barbearia fechada).
   - Atendimento de **Terça a Sábado**.
5. **Horários Dinâmicos (30 em 30 min):**
   - Das **09:00 às 17:30** (18 slots diários).
   - Consulta em tempo real aos horários ocupados.
   - A agenda de Juliano é **100% independente** da de Robert (ex: 10:00 ocupado com Juliano continua disponível para Robert).
6. **Confirmação:**
   - Modal com resumo detalhado.
   - Link direto para confirmação no WhatsApp com mensagem formatada.
   - Integração com Google Calendar e download de arquivo `.ics` para Apple/Android.

### Área Administrativa (Painel do Barbeiro)
1. **Dashboard & Relatórios:**
   - Gráfico interativo com agrupamento por **Dia, Semana, Mês e Ano**.
   - Alternador de métricas no gráfico: **Volume de Cortes** ou **Faturamento (R$)**.
   - Cards de KPI: Faturamento Realizado, Faturamento Previsto, Total de Atendimentos, Ticket Médio e Taxa de Conclusão.
   - Filtros de período: Hoje, Esta Semana, Este Mês, Este Ano e Todos.
2. **Agenda Diária:**
   - Lista cronológica de atendimentos do dia.
   - Botões de 1 toque: **Concluir**, **Cancelar**, **Reabrir** e **Chamar no WhatsApp**.
   - Botão para **Novo Agendamento Manual** (para encaixes de balcão ou telefone).
3. **Gestão de Preços & Simulador de Faturamento:**
   - Reajuste dos preços de Cabelo e Barba com salvamento no banco.
   - **Simulador Interativo:** projete o faturamento mensal simulando novos valores e veja o impacto financeiro percentual em tempo real.
4. **Top 10 Clientes (Ranking):**
   - Ranking com os clientes mais assíduos (Nome, Telefone, Total de Cortes e Valor total gerado).
   - Link direto para iniciar conversa no WhatsApp com cada cliente VIP.
