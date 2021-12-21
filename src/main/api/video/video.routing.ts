import { RouteBase } from '../../../base/route.base';
import { TodoController } from './video.controller';
import fileUpload from 'express-fileupload';
import express from 'express';
export class VideoRoute extends RouteBase {

  protected controller!: TodoController;

  constructor() {
    super();
  }

  protected initial(): void {
    this.controller = new TodoController();
    super.initial();
  }

  protected registerRoute(): void {
    this.router.post('/upload', [express.json(), fileUpload({ createParentPath: true })], this.responseHandler(this.controller.upload));
  }

}