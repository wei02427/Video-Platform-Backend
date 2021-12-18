// import express, { Application, Request, Response } from "express";
// import fs from 'fs';
// const app: Application = express();
// const port = 3000;

// // Body parsing Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get(
//     "/",
//     async (req: Request, res: Response): Promise<Response> => {
//         return res.status(200).send({
//             message: "Hello World!",
//         });
//     }
// );


// app.get('/video', function(req, res) {
//     const path = 'assets/MV IU아이유  strawberry moon_1080p.mp4'
//     const stat = fs.statSync(path)
//     const fileSize = stat.size
//     const range = req.headers.range
//     if (range) {
//       const parts = range.replace(/bytes=/, "").split("-")
//       const start = parseInt(parts[0], 10)
//       const end = parts[1] 
//         ? parseInt(parts[1], 10)
//         : fileSize-1
//       const chunksize = (end-start)+1
//       const file = fs.createReadStream(path, {start, end})
//       const head = {
//         'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//         'Accept-Ranges': 'bytes',
//         'Content-Length': chunksize,
//         'Content-Type': 'video/mp4',
//       }
//       res.writeHead(206, head);
//       file.pipe(res);
//     } else {
//       const head = {
//         'Content-Length': fileSize,
//         'Content-Type': 'video/mp4',
//       }
//       res.writeHead(200, head)
//       fs.createReadStream(path).pipe(res)
//     }
//   });

// app.listen(port, (): void => {
//     console.log(`Connected successfully on port ${port}`);
// });


import { App } from './app';
import { DefaultException } from './exception/default.exception';

const bootstrap = () => {
    const app = new App();
    app.setException(DefaultException);
    app.bootstrap();
};

bootstrap();