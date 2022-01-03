import { Router, Request, Response, NextFunction } from 'express';
import { ControllerBase } from './controller.base';

import { HttpStatus } from '../types/response.type';

import { ResponseObject } from '../common/response/response.object';
import session from 'express-session';

export abstract class RouteBase {

  public router = Router();
  protected controller!: ControllerBase;

  constructor() {
    this.initial();
  }

  protected initial(): void {
    this.registerRoute();

  }

  protected abstract registerRoute(): void;

  protected responseHandler(method: (req: Request, res: Response, next: NextFunction) => Promise<ResponseObject> | Promise<void>, controller = this.controller) {

    return (req: Request, res: Response, next: NextFunction) => {

      method.call(this.controller, req, res, next)
        .then(obj => {
      
          if (obj) {
            res.status(obj.status).json(obj);
          }
        })
        .catch((err: Error) =>
          next(controller.formatResponse(err.message, (err as any).status || HttpStatus.INTERNAL_ERROR)));
    };
  }

}