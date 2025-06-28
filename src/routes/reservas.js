const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva');
const Quarto = require('../models/quarto');
const Hospede = require('../models/hospede');
const { Op } = require('sequelize');

// --- Funções Auxiliares para Validação de Disponibilidade ---

/**
 * Verifica se um quarto está disponível para um determinado período.
 * @param {number} quartoId - ID do quarto a ser verificado.
 * @param {string} dataEntrada - Data de entrada da nova reserva (YYYY-MM-DD).
 * @param {string} dataSaida - Data de saída da nova reserva (YYYY-MM-DD).
 * @param {number} [excluirReservaId=null] - ID de uma reserva a ser excluída da verificação (útil para updates).
 * @returns {Promise<boolean>} - True se o quarto estiver disponível, false caso contrário.
 */

async function isQuartoDisponivel(quartoId, dataEntrada, dataSaida, excluirReservaId = null) {
    const dataEntradaNova = new Date(dataEntrada);
    const dataSaidaNova = new Date(dataSaida);

    // Garante que a data de entrada é anterior à data de saída
    if (dataEntradaNova >= dataSaidaNova) {
        return false;
    }

    // Verificar se o quarto existe e não está em manutenção
    const quarto = await Quarto.findByPk(quartoId);
    if (!quarto) {
        throw new Error('Quarto não encontrado.');
    }
    if (quarto.status === 'MANUTENCAO') {
        return false; // Quarto em manutenção nunca está disponível para reserva
    }

    // Buscar reservas existentes para o mesmo quarto que se sobreponham ao período da nova reserva
    const whereClause = {
        quartoId: quartoId,
        status: {
        [Op.in]: ['ATIVA', 'CONCLUIDA'] // Considera reservas ativas ou já concluídas (mas dentro do período)
        },
        [Op.or]: [
        {
            // Nova reserva começa durante uma reserva existente
            dataEntrada: { [Op.lt]: dataSaidaNova },
            dataSaida: { [Op.gt]: dataEntradaNova }
        }
        ]
    };

    if (excluirReservaId) {
        whereClause.id = { [Op.ne]: excluirReservaId }; // Exclui a própria reserva sendo atualizada
    }

    const reservasConflitantes = await Reserva.count({
        where: whereClause
    });

    return reservasConflitantes === 0;
}

// Obter todas as reservas
router.get('/', async (req, res) => {
    try {
        const reservas = await Reserva.findAll({
            include: [
                { model: Quarto, attributes: ['id', 'numero', 'tipo', 'status'] },
                { model: Hospede, attributes: ['id', 'nome', 'documento'] }
            ]
        });
        res.json(reservas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obter uma reserva por ID
router.get('/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id, {
            include: [
                { model: Quarto, attributes: ['id', 'numero', 'tipo', 'status'] },
                { model: Hospede, attributes: ['id', 'nome', 'documento'] }
            ]
        });
        if (reserva == null) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }
        res.json(reserva);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Criar uma nova reserva
router.post('/', async (req, res) => {
    const { dataEntrada, dataSaida, quartoId, hospedeId } = req.body; // Status inicial é sempre 'ATIVA'

    try {
        const quarto = await Quarto.findByPk(quartoId);
        if (!quarto) {
            return res.status(404).json({ message: 'Quarto não encontrado.' });
        }
        const hospede = await Hospede.findByPk(hospedeId);
        if (!hospede) {
            return res.status(404).json({ message: 'Hóspede não encontrado.' });
        }

        // Validação de datas
        if (new Date(dataEntrada) >= new Date(dataSaida)) {
            return res.status(400).json({ message: 'Data de entrada deve ser anterior à data de saída.' });
        }

        // Verificar disponibilidade do quarto considerando sobreposição
        const disponivel = await isQuartoDisponivel(quartoId, dataEntrada, dataSaida);
        if (!disponivel) {
            return res.status(400).json({ message: 'Quarto não disponível para o período selecionado devido a outras reservas ou manutenção.' });
        }

        // Cria a reserva com status ATIVA (inicialmente)
        const novaReserva = await Reserva.create({
            dataEntrada,
            dataSaida,
            quartoId,
            hospedeId,
            status: 'ATIVA' // Status padrão ao criar uma reserva
        });

        res.status(201).json(novaReserva);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Atualizar uma reserva
router.put('/:id', async (req, res) => {
    const { dataEntrada, dataSaida, quartoId, hospedeId, status } = req.body;
    try {
        const reserva = await Reserva.findByPk(req.params.id);
        if (reserva == null) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }

        const oldQuartoId = reserva.quartoId;
        const oldStatus = reserva.status;

        // Se o quarto ou as datas da reserva forem alterados, revalidar disponibilidade
        if (quartoId && quartoId !== oldQuartoId || dataEntrada && dataEntrada !== reserva.dataEntrada || dataSaida && dataSaida !== reserva.dataSaida) {
            const newQuartoId = quartoId || oldQuartoId;
            const newDataEntrada = dataEntrada || reserva.dataEntrada;
            const newDataSaida = dataSaida || reserva.dataSaida;

            const disponivel = await isQuartoDisponivel(newQuartoId, newDataEntrada, newDataSaida, reserva.id);
            if (!disponivel) {
                return res.status(400).json({ message: 'Alteração não possível: Quarto não disponível para o novo período ou quarto.' });
            }
        }

        // Atualiza os campos da reserva
        reserva.dataEntrada = dataEntrada || reserva.dataEntrada;
        reserva.dataSaida = dataSaida || reserva.dataSaida;
        reserva.quartoId = quartoId || reserva.quartoId;
        reserva.hospedeId = hospedeId || reserva.hospedeId;
        reserva.status = status || reserva.status; // Permitir alteração de status via PUT (ex: CANCELADA)

        await reserva.save();

        // Lógica para verificar se o quarto pode voltar a ser DISPONIVEL se a reserva for CANCELADA ou CONCLUIDA
        // e não houver outras reservas ativas para aquele quarto
        if (oldStatus === 'ATIVA' && (reserva.status === 'CANCELADA' || reserva.status === 'CONCLUIDA')) {
            const quarto = await Quarto.findByPk(oldQuartoId);
            if (quarto) {
                const outrasReservasAtivas = await Reserva.count({
                where: {
                    quartoId: oldQuartoId,
                    status: 'ATIVA',
                    id: { [Op.ne]: reserva.id } // Exclui a própria reserva
                }
                });
                if (outrasReservasAtivas === 0 && quarto.status !== 'DISPONIVEL') { // Só muda se não houver outras ativas
                quarto.status = 'DISPONIVEL';
                await quarto.save();
                }
            }
        }

        res.json(reserva);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Deletar uma reserva
router.delete('/:id', async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id);
        if (reserva == null) {
            return res.status(404).json({ message: 'Reserva não encontrada' });
        }

        const quartoId = reserva.quartoId;
        const oldStatus = reserva.status;

        await reserva.destroy();

        // Se a reserva deletada era ATIVA e o quarto estava OCUPADO,
        // verifica se o quarto pode voltar a ser DISPONIVEL
        if (oldStatus === 'ATIVA') {
            const outrasReservasAtivas = await Reserva.count({
                where: {
                quartoId: quartoId,
                status: 'ATIVA'
                }
            });

            if (outrasReservasAtivas === 0) {
                const quarto = await Quarto.findByPk(quartoId);
                if (quarto && quarto.status === 'OCUPADO') {
                quarto.status = 'DISPONIVEL'; // Quarto volta a ser disponível
                await quarto.save();
                }
            }
        }

        res.json({ message: 'Reserva deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check-in de uma reserva
router.post('/:id/checkin', async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id, {
            include: Quarto
        });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }

        if (reserva.status !== 'ATIVA') {
            return res.status(400).json({ message: 'Esta reserva não está no status ATIVA para realizar o check-in.' });
        }

        const quarto = reserva.Quarto; // Acessa o quarto associado à reserva

        if (quarto.status === 'OCUPADO') {
            return res.status(400).json({ message: 'O quarto já está ocupado.' });
        }
        if (quarto.status === 'MANUTENCAO') {
            return res.status(400).json({ message: 'Não é possível fazer check-in em quarto em manutenção.' });
        }
        
        // Atualiza o status do quarto para OCUPADO
        quarto.status = 'OCUPADO';
        await quarto.save();

        res.json({ message: `Check-in da reserva ${reserva.id} realizado. Quarto ${quarto.numero} agora está OCUPADO.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check-out de uma reserva
router.post('/:id/checkout', async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id, {
            include: Quarto
        });

        if (!reserva) {
            return res.status(404).json({ message: 'Reserva não encontrada.' });
        }

        if (reserva.status !== 'ATIVA') {
            return res.status(400).json({ message: 'Esta reserva não está no status ATIVA para realizar o check-out.' });
        }
        
        const quarto = reserva.Quarto;

        // Atualiza o status da reserva para CONCLUIDA
        reserva.status = 'CONCLUIDA';
        await reserva.save();

        // Verifica se há outras reservas ATIVAS para o mesmo quarto para o futuro.
        // Se não houver, o quarto pode voltar a ser DISPONIVEL.
        const outrasReservasAtivas = await Reserva.count({
            where: {
                quartoId: quarto.id,
                status: 'ATIVA',
                dataEntrada: { [Op.gte]: new Date().toISOString().split('T')[0] } // Considera apenas reservas futuras ou de hoje
            }
        });

        if (quarto.status === 'OCUPADO' && outrasReservasAtivas === 0) {
            quarto.status = 'DISPONIVEL';
            await quarto.save();
        }

        res.json({ message: `Check-out da reserva ${reserva.id} realizado. Quarto ${quarto.numero} agora está DISPONIVEL (se não houver outras reservas ativas).` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;