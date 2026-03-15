const express = require('express');
const { authenticate, createToken } = require('./middleware/auth');

const app = express();
app.use(express.json());

// Public: generate a demo token
app.post('/auth/token', (req, res) => {
  const { userId, role = 'user' } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const token = createToken({ userId, role });
  res.json({ token });
});

// Protected: requires valid JWT
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Access granted', user: req.user });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
