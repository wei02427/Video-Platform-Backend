import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';

import { HttpStatus } from '../../../types/response.type';
import { VideoService } from './video.service';
import crypto from 'crypto';


import fs from 'fs';

export class TodoController extends ControllerBase {
    private videoService!: VideoService;

    protected init(): void {
        this.videoService = new VideoService();

    }

    public async upload(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {

        const { title } = req.body;
        const user = req.user;

        console.log(user)
        const folderName = crypto.createHash('md5').update(title + user!.id + Date.now().toString()).digest('hex');

        const file = (req.files!.video as UploadedFile);
        await this.videoService.upload(user!.id!, title, folderName, file.data);

        return this.formatResponse('ok', HttpStatus.OK);
    }


    public async getPlaylist(req: Request, res: Response, next: NextFunction) {

        const range = req.headers.range;
        const { hash } = req.params;
        const mpd = await this.videoService.getMPD(hash);


        // res.set({
        //     'Content-Type': 'application/dash+xml',
        //     'Content-Length': '1567'
        // })

        mpd.createReadStream().pipe(res);

    }


    public async getMP4(req: Request, res: Response, next: NextFunction) {

        const range = req.headers.range;
        const { hash, filename } = req.params;
        const mpd = await this.videoService.getMP4(hash, filename);


        // res.set({
        //     'Content-Type': 'application/dash+xml',
        //     'Content-Length': '1567'
        // })

        mpd.createReadStream().pipe(res);

    }

}
