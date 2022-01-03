import { HttpStatus } from '../types/response.type';
import { ResponseObject } from '../common/response/response.object';
import Database from '../database/database';
import {  Request, Response, NextFunction } from 'express';
import Autobind from '../utils/autobind';

export abstract class ControllerBase {
  // protected db = Database.getInstance();


  constructor() {
    this.init();
  }

  protected init() { };

  public formatResponse(data: any, status = HttpStatus.INTERNAL_ERROR): ResponseObject {

    const options: any = { status };

    status >= 400
      ? options.message = data
      : options.data = data;

    const responseObject = new ResponseObject(options);

    return responseObject;
  }

  @Autobind
  public ensureAuthenticated(req: Request, res: Response, next: NextFunction) {

    // 若使用者已通過驗證，則觸發 next()
    if (req.isAuthenticated())
      return next();


    const error = this.formatResponse('尚未登入', HttpStatus.UNAUTHORIZED);
    next(error);
  }


}