-- ==============================================================================
-- J&R BARBEARIA - SEED DATA INICIAL
-- Dados de teste para Barbeiros, Serviços e Agendamentos Históricos
-- ==============================================================================

-- Inserir ou atualizar Barbeiros
INSERT INTO public.barbeiros (id, nome, login, senha, preco_cabelo, preco_barba, telefone, bio)
VALUES
    ('juliano', 'Juliano', 'juliano', 'juliano123', 35.00, 20.00, '(32) 98456-1005', 'Especialista em cortes clássicos, fades perfeitos e visagismo masculino.'),
    ('robert', 'Robert', 'robert', 'robert123', 35.00, 20.00, '(32) 98456-1005', 'Mestre na navalha tradicional, barba alinhada e tratamentos capilares.')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    login = EXCLUDED.login,
    senha = EXCLUDED.senha,
    preco_cabelo = EXCLUDED.preco_cabelo,
    preco_barba = EXCLUDED.preco_barba,
    telefone = EXCLUDED.telefone,
    bio = EXCLUDED.bio;

-- Inserir ou atualizar Serviços
INSERT INTO public.servicos (id, nome, duracao_min, descricao)
VALUES
    ('cabelo', 'Corte de Cabelo', 30, 'Corte moderno ou clássico, acabamento na navalha e finalização.'),
    ('barba', 'Apenas Barba', 30, 'Design de barba com toalha quente, navalha e óleo hidratante.'),
    ('cabelo_barba', 'Cabelo e Barba', 30, 'Combo completo: corte de cabelo estilizado + tratamento e alinhamento de barba.')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    duracao_min = EXCLUDED.duracao_min,
    descricao = EXCLUDED.descricao;

-- Inserir Agendamentos de Amostra para Juliano e Robert
-- Obs: Gera agendamentos passados concluídos e agendamentos futuros para alimentar relatórios e agenda
INSERT INTO public.agendamentos (cliente_nome, cliente_telefone, barbeiro_id, servico, data, horario, valor_cobrado, status)
VALUES
    -- Agendamentos de Juliano
    ('Marcos Oliveira', '(11) 99123-4567', 'juliano', 'cabelo_barba', CURRENT_DATE - INTERVAL '1 day', '09:30:00', 55.00, 'concluido'),
    ('Lucas Silveira', '(11) 98234-5678', 'juliano', 'cabelo', CURRENT_DATE - INTERVAL '1 day', '10:30:00', 35.00, 'concluido'),
    ('Rodrigo Santos', '(11) 97345-6789', 'juliano', 'barba', CURRENT_DATE - INTERVAL '2 days', '14:00:00', 20.00, 'concluido'),
    ('Marcos Oliveira', '(11) 99123-4567', 'juliano', 'cabelo', CURRENT_DATE - INTERVAL '15 days', '11:00:00', 35.00, 'concluido'),
    ('Marcos Oliveira', '(11) 99123-4567', 'juliano', 'cabelo_barba', CURRENT_DATE - INTERVAL '30 days', '09:00:00', 55.00, 'concluido'),
    ('Felipe Andrade', '(11) 96456-7890', 'juliano', 'cabelo_barba', CURRENT_DATE - INTERVAL '3 days', '16:00:00', 55.00, 'concluido'),
    ('Gustavo Lima', '(11) 95567-8901', 'juliano', 'cabelo', CURRENT_DATE - INTERVAL '5 days', '15:30:00', 35.00, 'concluido'),
    ('Lucas Silveira', '(11) 98234-5678', 'juliano', 'cabelo', CURRENT_DATE - INTERVAL '20 days', '10:00:00', 35.00, 'concluido'),
    ('Bruno Souza', '(11) 94678-9012', 'juliano', 'cabelo_barba', CURRENT_DATE - INTERVAL '40 days', '16:30:00', 55.00, 'concluido'),
    ('Marcos Oliveira', '(11) 99123-4567', 'juliano', 'cabelo_barba', CURRENT_DATE, '10:00:00', 55.00, 'agendado'),
    ('Daniel Costa', '(11) 93789-0123', 'juliano', 'cabelo', CURRENT_DATE, '11:30:00', 35.00, 'agendado'),
    ('Eduardo Pereira', '(11) 92890-1234', 'juliano', 'barba', CURRENT_DATE, '14:30:00', 20.00, 'agendado'),

    -- Agendamentos de Robert (Agenda independente)
    ('Thiago Mendes', '(11) 91901-2345', 'robert', 'cabelo_barba', CURRENT_DATE - INTERVAL '1 day', '10:00:00', 55.00, 'concluido'),
    ('Carlos Eduardo', '(11) 90012-3456', 'robert', 'cabelo', CURRENT_DATE - INTERVAL '2 days', '11:00:00', 35.00, 'concluido'),
    ('Thiago Mendes', '(11) 91901-2345', 'robert', 'barba', CURRENT_DATE - INTERVAL '10 days', '15:00:00', 20.00, 'concluido'),
    ('Thiago Mendes', '(11) 91901-2345', 'robert', 'cabelo_barba', CURRENT_DATE - INTERVAL '25 days', '14:30:00', 55.00, 'concluido'),
    ('Gabriel Nogueira', '(11) 98923-4567', 'robert', 'cabelo', CURRENT_DATE - INTERVAL '4 days', '16:00:00', 35.00, 'concluido'),
    ('Rafael Martins', '(11) 97834-5678', 'robert', 'cabelo_barba', CURRENT_DATE - INTERVAL '7 days', '09:00:00', 55.00, 'concluido'),
    ('Matheus Alves', '(11) 96745-6789', 'robert', 'cabelo', CURRENT_DATE - INTERVAL '12 days', '17:00:00', 35.00, 'concluido'),
    ('Leandro Ramos', '(11) 95656-7890', 'robert', 'barba', CURRENT_DATE, '09:30:00', 20.00, 'agendado'),
    ('Thiago Mendes', '(11) 91901-2345', 'robert', 'cabelo_barba', CURRENT_DATE, '14:00:00', 55.00, 'agendado')
ON CONFLICT DO NOTHING;
