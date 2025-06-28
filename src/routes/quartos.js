const express = require('express');
const router = express.Router();
const Quarto = require('../models/quarto');

// Obter todos os quartos
router.get('/', async (req, res) => {
    try {
        const quartos = await Quarto.findAll();
        res.json(quartos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obter um quarto por ID
router.get('/:id', async (req, res) => {
    try {
        const quarto = await Quarto.findByPk(req.params.id);
        if (quarto == null) {
            return res.status(404).json({ message: 'Quarto não encontrado' });
        }
        res.json(quarto);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Criar um novo quarto
router.post('/', async (req, res) => {
    const { numero, tipo, status, precoDiaria } = req.body;
    try {
        const novoQuarto = await Quarto.create({ numero, tipo, status, precoDiaria });
        res.status(201).json(novoQuarto);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Atualizar um quarto
router.put('/:id', async (req, res) => {
    const { numero, tipo, status, precoDiaria } = req.body;
    try {
        const quarto = await Quarto.findByPk(req.params.id);
        if (quarto == null) {
            return res.status(404).json({ message: 'Quarto não encontrado' });
        }
        quarto.numero = numero || quarto.numero;
        quarto.tipo = tipo || quarto.tipo;
        quarto.status = status || quarto.status;
        quarto.precoDiaria = precoDiaria || quarto.precoDiaria;
        await quarto.save();
        res.json(quarto);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Deletar um quarto
router.delete('/:id', async (req, res) => {
    try {
        const quarto = await Quarto.findByPk(req.params.id);
        if (quarto == null) {
            return res.status(404).json({ message: 'Quarto não encontrado' });
        }
        await quarto.destroy();
        res.json({ message: 'Quarto deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;