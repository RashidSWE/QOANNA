import type { Application, Request, Response } from 'express'
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const express = require('express');


const app: Application = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from the user Service!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
