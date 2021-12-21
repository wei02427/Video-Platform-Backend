import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';
import streamFileUpload from '../../../database/bucket';
import { HttpStatus } from '../../../types/response.type';
import { VideoService } from './video.service';

export class TodoController extends ControllerBase {
    private videoService!: VideoService;

    protected init(): void {
        this.videoService = new VideoService();

    }

    public async upload(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {

        // console.log(req.files, 'aa');
        // console.log(req.body)
        const { title } = req.body;
        const file = (req.files!.video as UploadedFile);
        await this.videoService.upload(title, file.name, file.data);
        return this.formatResponse('ok', HttpStatus.OK);
    }


}