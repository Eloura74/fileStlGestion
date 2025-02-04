import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne!' });
});

app.listen(3001, () => {
  console.log('Serveur de test démarré sur http://localhost:3001');
});
