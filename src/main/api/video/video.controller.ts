import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';

import { HttpStatus } from '../../../types/response.type';
import { VideoService } from './video.service';
import crypto from 'crypto';




export class TodoController extends ControllerBase {
    private videoService!: VideoService;

    protected init(): void {
        this.videoService = new VideoService();

    }

    public async upload(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {

        const { title } = req.body;
        const user = req.session.user;
        const folderName = crypto.createHash('md5').update(title + user + Date.now()).digest('hex');

        const file = (req.files!.video as UploadedFile);
        await this.videoService.upload(title, folderName, file.data);
        
        return this.formatResponse('ok', HttpStatus.OK);
    }


    public async download(req: Request, res: Response, next: NextFunction) {

        const range = req.headers.range;
        const vid = req.params.hash;
        const { info, video } = await this.videoService.get(vid);

        if (range) {

            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : info.size - 1
            const chunksize = (end - start) + 1


            const head = {
                'Content-Range': `bytes ${start}-${end}/${info.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
            video.createReadStream({ start, end }).pipe(res);
            // return this.formatResponse(null, 206);


        } else {
            const head = {
                'Content-Length': info.size,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(HttpStatus.PARTIAL_CONTENT, head)
            video.createReadStream().pipe(res)
            // return this.formatResponse(null, HttpStatus.OK);

        }

    }

}
