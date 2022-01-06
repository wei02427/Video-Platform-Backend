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

        const { title } = req.body;
        const user = req.user;

        console.log(user)
        const folderName = crypto.createHash('md5').update(title + user!.id + Date.now().toString()).digest('hex');

        const file = (req.files!.video as UploadedFile);
        await this.videoService.upload(user!.id!, title, folderName, file.data);

        return this.formatResponse('ok', HttpStatus.OK);
    }




    @Autobind
    public async getVideo(req: Request, res: Response, next: NextFunction) {

        const range = req.headers.range;
        const { hash, filename } = req.params;
        const [file, metaData] = await this.videoService.getVideo(hash, filename);


        res.set({
            'Content-Type': metaData.contentType,
            'Content-Length': metaData.size
        })

        file.createReadStream().pipe(res);

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
