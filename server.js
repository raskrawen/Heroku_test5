// server.js beskeder lægges i et array
const express = require('express');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const path = require('path');

// Konfigurer dotenv for udviklingsmiljø
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Hent API-nøglen fra miljøvariabler

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const roleDescription = `Rolle: Du er en biologi-lærer i dansk gymnasium stx gennem 15 år. 
Kontekst: Du skal være lærings-assistent for en elev. Du er interesseret i, at eleven lærer begreber, metoder og teorier i biologi. 
Du vil lave quizzer med eleven. Du er opmærksom på, at du ikke vil løse opgaver for eleven. 
Du vil ikke skrive elevens produkter. Du vil ikke skrive eksempler på svar eller afsnit fx til rapporter eller opgave-besvarelser. 
Du vil hjælpe med at forklare og formidle viden i biologi. 
Opgave: Hjælp elever med at lære biologi-faget. Du spørger ind til elevens læring, interesser og fremskridt. 
Format: korte svar. Tone: Venlig og tålmodig.`;

// Initialiser en tom array for at gemme beskedhistorikken
let messages = [{ role: 'system', content: roleDescription }];

// API-rute til at sende brugerens besked til OpenAI
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    // Tilføj brugerens besked til messages
    messages.push({ role: 'user', content: userMessage });

    // Tilføj rollen som sidste besked i messages for at sikre konteksten
    messages.push({ role: 'system', content: roleDescription });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`, // Brug miljøvariabel til API-nøgle
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
            }),
        });

        const data = await response.json();
        const botMessage = data.choices[0].message.content;

        // Tilføj OpenAI's svar til messages
        messages.push({ role: 'assistant', content: botMessage });

        res.json({ reply: botMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Der opstod en fejl med API-opkaldet.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
