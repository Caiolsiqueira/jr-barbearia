-- ==============================================================================
-- J&R BARBEARIA - SCHEMA SUPABASE (POSTGRESQL)
-- Barbearia para dois profissionais independentes: Juliano e Robert
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE BARBEIROS (barbers)
CREATE TABLE IF NOT EXISTS public.barbeiros (
    id TEXT PRIMARY KEY,                       -- 'juliano', 'robert'
    nome TEXT NOT NULL,                        -- 'Juliano', 'Robert'
    login TEXT UNIQUE NOT NULL,                -- 'juliano', 'robert'
    senha TEXT NOT NULL,                        -- Senha ou hash para autenticação simples
    preco_cabelo NUMERIC(10,2) NOT NULL DEFAULT 35.00,
    preco_barba NUMERIC(10,2) NOT NULL DEFAULT 20.00,
    telefone TEXT DEFAULT '(32) 98456-1005',
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABELA DE SERVIÇOS (services)
CREATE TABLE IF NOT EXISTS public.servicos (
    id TEXT PRIMARY KEY,                       -- 'cabelo', 'barba', 'cabelo_barba'
    nome TEXT NOT NULL,
    duracao_min INTEGER NOT NULL DEFAULT 30,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABELA DE AGENDAMENTOS (appointments)
CREATE TABLE IF NOT EXISTS public.agendamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,            -- Formato: (XX) XXXXX-XXXX
    barbeiro_id TEXT NOT NULL REFERENCES public.barbeiros(id) ON DELETE CASCADE,
    servico TEXT NOT NULL REFERENCES public.servicos(id),
    data DATE NOT NULL,                        -- Apenas Terça a Sábado
    horario TIME NOT NULL,                     -- Entre 09:00 e 17:30 (slots de 30m)
    valor_cobrado NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. CONSTRAINT DE UNICIDADE: IMPEDIR HORÁRIOS DUPLICADOS PARA O MESMO BARBEIRO
-- A agenda do Juliano é 100% independente da do Robert!
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'idx_barbeiro_data_horario_unique'
    ) THEN
        ALTER TABLE public.agendamentos 
        ADD CONSTRAINT idx_barbeiro_data_horario_unique UNIQUE (barbeiro_id, data, horario);
    END IF;
END $$;

-- 6. ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agendamentos_barbeiro_data ON public.agendamentos (barbeiro_id, data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos (status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON public.agendamentos (cliente_telefone);

-- 7. ROW LEVEL SECURITY (RLS) - CONFIGURAÇÃO RECOMENDADA
ALTER TABLE public.barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura e agendamento pelo cliente
DROP POLICY IF EXISTS "Permitir leitura pública de barbeiros" ON public.barbeiros;
DROP POLICY IF EXISTS "Permitir gestão de barbeiros" ON public.barbeiros;
CREATE POLICY "Permitir gestão de barbeiros" ON public.barbeiros FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir leitura pública de servicos" ON public.servicos;
DROP POLICY IF EXISTS "Permitir gestão de servicos" ON public.servicos;
CREATE POLICY "Permitir gestão de servicos" ON public.servicos FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir agendamento público" ON public.agendamentos;
CREATE POLICY "Permitir agendamento público" ON public.agendamentos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir consulta pública de disponibilidade" ON public.agendamentos;
CREATE POLICY "Permitir consulta pública de disponibilidade" ON public.agendamentos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir gestão de agendamentos" ON public.agendamentos;
CREATE POLICY "Permitir gestão de agendamentos" ON public.agendamentos FOR ALL USING (true);
