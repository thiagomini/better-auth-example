import express from 'express';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { auth } from '#lib/auth.ts';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.all('/api/auth/*splat', toNodeHandler(auth));

app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
