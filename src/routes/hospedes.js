const express = require('express');
const router = express.Router();
const Hospede = require('../models/hospede');

// Obter todos os hóspedes
router.get('/', async (req, res) => {
    try {
        const hospedes = await Hospede.findAll();
        res.json(hospedes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obter um hóspede por ID
router.get('/:id', async (req, res) => {
    try {
        const hospede = await Hospede.findByPk(req.params.id);
        if (hospede == null) {
            return res.status(404).json({ message: 'Hóspede não encontrado' });
        }
        res.json(hospede);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Criar um novo hóspede
router.post('/', async (req, res) => {
    const { nome, documento, telefone, email } = req.body;
    try {
        const novoHospede = await Hospede.create({ nome, documento, telefone, email });
        res.status(201).json(novoHospede);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Atualizar um hóspede
router.put('/:id', async (req, res) => {
    const { nome, documento, telefone, email } = req.body;
    try {
        const hospede = await Hospede.findByPk(req.params.id);
        if (hospede == null) {
            return res.status(404).json({ message: 'Hóspede não encontrado' });
        }
        hospede.nome = nome || hospede.nome;
        hospede.documento = documento || hospede.documento;
        hospede.telefone = telefone || hospede.telefone;
        hospede.email = email || hospede.email;
        await hospede.save();
        res.json(hospede);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Deletar um hóspede
router.delete('/:id', async (req, res) => {
    try {
        const hospede = await Hospede.findByPk(req.params.id);
        if (hospede == null) {
            return res.status(404).json({ message: 'Hóspede não encontrado' });
        }
        await hospede.destroy();
        res.json({ message: 'Hóspede deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;