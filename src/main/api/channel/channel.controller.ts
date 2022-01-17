import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';

import { HttpStatus } from '../../../types/response.type';
import { VideoService } from './channel.service';
import crypto from 'crypto';



import Autobind from '../../../utils/autobind';
import AccountService from '../../auth/account/account.service';
import _ from 'lodash';

export class VideoController extends ControllerBase {
    private videoService!: VideoService;
    private accountService!: AccountService;

    protected init(): void {
        this.videoService = new VideoService();
        this.accountService = new AccountService();
    }

    public async upload(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {


        const user = req.user;
        const { title, description } = req.body;

        const file = (req.files!.video as UploadedFile);
        const img = (req.files!.img as UploadedFile);

        const folderName = crypto.createHash('md5').update(file.name + user!.id + Date.now().toString()).digest('hex');



        await this.videoService.upload(user!.id!, title, description, folderName, file.data, img.data);

        return this.formatResponse('ok', HttpStatus.OK);
    }




    @Autobind
    public async getVideo(req: Request, res: Response, next: NextFunction) {


        const { hash, filename } = req.params;
        const [file, metaData] = await this.videoService.getVideo(hash, filename);


        res.set({
            'Content-Type': metaData.contentType,
            'Content-Length': metaData.size
        })

        file.createReadStream().pipe(res);

    }


    @Autobind
    public async getLibrary(req: Request, res: Response, next: NextFunction) {

        const id: number = req.user ? req.user.id! : _.toNumber(req.params.id);

        const result = await this.videoService.getVideos(id);
        return this.formatResponse(result, HttpStatus.OK);

    }

    @Autobind
    public async getVideoCover(req: Request, res: Response, next: NextFunction) {

        const hash: string = req.params.hash

        const [file, metaData] = await this.videoService.getVideoCover(hash);
        // return this.formatResponse(result, HttpStatus.OK);

        res.contentType(metaData.contentType);
        file.createReadStream().pipe(res);
    }

    @Autobind
    public async deleteVideo(req: Request, res: Response, next: NextFunction) {

        const hash: string = req.params.hash

        await this.videoService.deleteVideo(hash);
        // return this.formatResponse(result, HttpStatus.OK);

        return this.formatResponse('ok', HttpStatus.OK);
    }

    public async addSubscriber(req: Request, res: Response, next: NextFunction) {

        const { uid } = req.body;
        const subscriber = req.user?.id!;
        await this.accountService.addSubscriber(subscriber, uid);
        return this.formatResponse('ok', HttpStatus.OK);
    }

    public async removeSubscriber(req: Request, res: Response, next: NextFunction) {

        const { uid } = req.params;
        const subscriber = req.user?.id!;
        await this.accountService.removeSubscriber(subscriber, _.toNumber(uid));
        return this.formatResponse('ok', HttpStatus.OK);
    }


}
