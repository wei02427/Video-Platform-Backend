import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';

import { HttpStatus } from '../../../types/response.type';
import { ChannelService } from './channel.service';
import crypto from 'crypto';



import Autobind from '../../../utils/autobind';
import AccountService from '../../auth/account/account.service';
import _ from 'lodash';

export class VideoController extends ControllerBase {
    private channelService!: ChannelService;
    private accountService!: AccountService;

    protected init(): void {
        this.channelService = new ChannelService();
        this.accountService = new AccountService();
    }

    public async upload(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {


        const user = req.user;
        const { title, description } = req.body;

        const file = (req.files!.video as UploadedFile);
        const img = (req.files!.img as UploadedFile);

        const folderName = crypto.createHash('md5').update(file.name + user!.id + Date.now().toString()).digest('hex');



        await this.channelService.upload(user!, title, description, folderName, file.data, img.data);

        return this.formatResponse('ok', HttpStatus.OK);
    }




    @Autobind
    public async getVideo(req: Request, res: Response, next: NextFunction) {


        const { hash, filename } = req.params;
        const video = await this.channelService.getVideo(hash, filename);

        if (!_.isNull(video)) {
            const [file, metaData] = video;
            res.set({
                'Content-Type': metaData.contentType,
                'Content-Length': metaData.size
            })

            file.createReadStream().pipe(res);
        } else {
            return this.formatResponse('not found', HttpStatus.NOT_FOUND);

        }


    }


    @Autobind
    public async getLibrary(req: Request, res: Response, next: NextFunction) {

        const id: number = req.params.uid ? _.toNumber(req.params.uid) : req.user!.id!;

        const videos = await this.channelService.getVideosByUid(id);

        let result = {};

        // 如果 api 附帶 uid 資訊，就是查看別人的頻道
        if (req.params.uid) {
            const channelID = _.toNumber(req.params.uid);
            const uid = req.user?.id;

            const name = await this.channelService.getChannelName(id);

            const isSelf = uid === channelID ? true : undefined;
            const isSubscriber = !_.isUndefined(uid) && !isSelf ? await this.channelService.checkSubscriber(uid, channelID) : undefined;


            result = { name, isSelf, isSubscriber };
        }

        result = { ...result, videos };

        return this.formatResponse(result, HttpStatus.OK);

    }

    @Autobind
    public async getVideoInfo(req: Request, res: Response, next: NextFunction) {

        const hash: string = req.params.hash;
        const uid = req.user?.id;
        const info = await this.channelService.getVideoInfo(hash);

        const isSelf = uid === info.uid ? true : undefined;
        const isSubscriber = !_.isUndefined(uid) && !isSelf ? await this.channelService.checkSubscriber(uid, info.uid) : undefined;

        return this.formatResponse({ ...info, isSubscriber, isSelf }, HttpStatus.OK);
    }

    @Autobind
    public async getVideoCover(req: Request, res: Response, next: NextFunction) {

        const hash: string = req.params.hash

        const [file, metaData] = await this.channelService.getVideoCover(hash);

        res.contentType(metaData.contentType);
        file.createReadStream().pipe(res);
    }

    @Autobind
    public async deleteVideo(req: Request, res: Response, next: NextFunction) {

        const hash: string = req.params.hash

        await this.channelService.deleteVideo(hash);

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
