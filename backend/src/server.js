require('dotenv').config();
const app = require('./app');

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Also listen on port 5000 if PORT is 3000 (or vice versa) so both 3000 and 5000 work seamlessly
const ALT_PORT = PORT === 3000 ? 5000 : 3000;
const altServer = app.listen(ALT_PORT, () => {
    console.log(`Server is also listening on http://localhost:${ALT_PORT}`);
});
altServer.on('error', () => {
    // Ignore if alternative port is already in use
});
