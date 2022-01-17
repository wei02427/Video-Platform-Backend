import { Request, Response, NextFunction } from 'express';
import { UploadedFile } from 'express-fileupload';

import { ControllerBase } from '../../../base/controller.base';
import _ from 'lodash';
import SearchService from './search.service';
import { HttpStatus } from '../../../types/response.type';
import Autobind from '../../../utils/autobind';

export class SearchController extends ControllerBase {
    private searchService!: SearchService;

    protected init(): void {
        this.searchService = new SearchService();
    }

    @Autobind
    public async search(req: Request, res: Response, next: NextFunction) {

        const { parm } = req.params;
        // console.log(parm, 'fku');
        const result = await this.searchService.getVideos({ text: parm });
        // console.log(result);
        return this.formatResponse(result, HttpStatus.OK);
    }


}
