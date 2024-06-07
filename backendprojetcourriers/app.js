const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./database');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const fournisseurRoute = require('./routes/fournisseurRoute');
const factureRoute = require('./routes/factureRoute');
const piecejointRoute = require('./routes/piecejointRoute');
const bordereauRoute = require('./routes/bordereauxRoute');
const reclamationRoute = require('./routes/reclamationRoute');
const etatRoute = require('./routes/etatRoute');
const archiveRoute = require('./routes/archiveRoute');
const { translateText } = require('./translation');
connectDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin:'*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const server = http.createServer(app); // cree un serveur http en utilisant express app
const io = socketIo(server, {
  //configuration de cors
  cors: {
    origin: ["http://localhost:3000",'http://localhost:8081'],
    methods: ["GET", "POST"]
  }
}); 

const publicPath = path.join(__dirname, 'C:\Users\pc\Desktop\PFE\PFE_Project\frontends1');
app.use(express.static(publicPath));


app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/fournisseur', fournisseurRoute);
app.use('/facture', factureRoute(io));
app.use('/piecejoint', piecejointRoute);
app.use('/bordereaux', bordereauRoute);
app.use('/reclamation', reclamationRoute(io)); 
app.use('/etat', etatRoute);
app.use('/archive', archiveRoute);
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  try {
    const translatedText = await translateText(text, targetLanguage);
    res.json({ translatedText });
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' });
  }
});
// Start server
const PORT = process.env.PORT || 3006;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}/`);
});
