import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createReadStream, statSync } from 'fs';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.get('/video', (req, res) => {

    const range = req.headers.range;
    if (!range) {
        req.send("Required range");
    }

    const filePath = `${__dirname}/video/video.mp4`;
    const fileSize = statSync(filePath).size;

    const chunkSize = 10 ** 6; // 1000000 bytes = 1 mb

    const start = Number(range.replace(/\D/g, ""));
    // 500 kb, 1 mb
    const end = Math.min(start + chunkSize, fileSize);
    //   700 - 0 +1 = 701
    const contentLength = end - start + 1;

    // stream video
    const fileStream = createReadStream(filePath, {
        start,
        end,
    });
    fileStream.pipe(res); // send data

    // send data means write heading
    const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4'
    }
    res.writeHead(206, headers);
});

app.listen(port, () => {
    console.log(`Application Run On http://localhost:${port}`);
});