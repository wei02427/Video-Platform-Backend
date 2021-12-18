import { Request, Response, NextFunction } from 'express';
import { ControllerBase } from '../../../base/controller.base';
import { ResponseObject } from '../../../common/response/response.object';
import { HttpStatus } from '../../../types/response.type';

import connection from '../../../database/database';
export class TodoController extends ControllerBase {

    public async getTodos(req: Request, res: Response, next: NextFunction): Promise<ResponseObject> {

        let result: any;
         connection.query(
            "SELECT * FROM `Account`", req.params.userId,
            function (error, results, fields) {
                if (error) throw error;
                result = JSON.stringify(results[0]);
                console.log(result,'sss');
            }
        );
        console.log(result,'aaa')
        return this.formatResponse(result, HttpStatus.OK);
    }


}