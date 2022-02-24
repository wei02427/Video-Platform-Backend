import { Request, Response, NextFunction } from 'express';

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
        const result = await this.searchService.searchVideos({ text: parm });

        return this.formatResponse(result, HttpStatus.OK);
    }


    @Autobind
    public async getRandomVideos(req: Request, res: Response, next: NextFunction) {

        const result = await this.searchService.getRandomVideos();
        
        return this.formatResponse(result, HttpStatus.OK);
    }
}
