import { Request, Response, NextFunction } from 'express';
import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';
import { HttpStatus } from '../../../types/response.type';

export class TodoController extends ControllerBase {


    public async getTodos(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {

        const result = await this.db('Account').select('*');
        return this.formatResponse(result, HttpStatus.OK);
    }


}