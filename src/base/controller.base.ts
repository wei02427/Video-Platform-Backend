import { HttpStatus } from '../types/response.type';
import { ResponseObject } from '../common/response/response.object';
import Database from '../database/database';

export abstract class ControllerBase {
  protected db = Database.getInstance();


  constructor() {
    this.init();
  }

  protected  init(){};


  public formatResponse(data: any, status = HttpStatus.INTERNAL_ERROR): ResponseObject {
    const options: any = { status };

    status >= 400
      ? options.message = data
      : options.data = data;

    const responseObject = new ResponseObject(options);

    return responseObject;
  }

}