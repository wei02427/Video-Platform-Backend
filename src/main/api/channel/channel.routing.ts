import { RouteBase } from '../../../base/route.base';
import { VideoController } from './channel.controller';
import fileUpload from 'express-fileupload';
import express from 'express';
export class VideoRoute extends RouteBase {

  protected controller!: VideoController;

  constructor() {
    super();
  }

  protected initial(): void {
    this.controller = new VideoController();
    super.initial();
  }

  protected registerRoute(): void {
    this.router.post('/upload',
      this.controller.ensureAuthenticated,
      [express.json(), fileUpload({ createParentPath: true })]
      , this.responseHandler(this.controller.upload));

    this.router.get('/watch/:hash/:filename', express.json(), this.controller.getVideo);

    this.router.get('/library',
      // this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.getLibrary));

    this.router.get('/video/cover/:hash',
      this.responseHandler(this.controller.getVideoCover));

    this.router.delete('/video/:hash',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.deleteVideo)
    );

    this.router.post('/addSubscriber',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.addSubscriber)
    );

    this.router.delete('/removeSubscriber/:uid',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.removeSubscriber)
    );
  }



}