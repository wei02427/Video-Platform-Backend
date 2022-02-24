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

    // 上傳影片
    this.router.post('/upload',
      this.controller.ensureAuthenticated,
      [express.json(), fileUpload({ createParentPath: true })]
      , this.responseHandler(this.controller.upload));

    // 取得影片 dash
    this.router.get('/watch/:hash/:filename', express.json(), this.controller.getVideo);

    // 取得頻道所有影片
    this.router.get('/library/:uid?',
      this.responseHandler(this.controller.getLibrary));

    // 取得影片資訊
    this.router.get('/video/info/:hash',  this.responseHandler(this.controller.getVideoInfo));
    
    // 取得影片封面圖
    this.router.get('/video/cover/:hash',
      this.responseHandler(this.controller.getVideoCover));

    // 刪除影片
    this.router.delete('/video/:hash',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.deleteVideo)
    );

    // 訂閱頻道
    this.router.post('/addSubscriber',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.addSubscriber)
    );

    // 取消訂閱頻道
    this.router.delete('/removeSubscriber/:uid',
      this.controller.ensureAuthenticated,
      express.json(),
      this.responseHandler(this.controller.removeSubscriber)
    );
  }



}