import { RouteBase } from '../../base/route.base';
import { VideoRoute } from './channel/channel.routing';

export class ApiRoute extends RouteBase {

  private videoRoute !:VideoRoute;

  constructor() {
    super();
  }
  protected initial(): void {
    this.videoRoute = new VideoRoute();
    super.initial();
}
  protected registerRoute(): void {
    this.router.use('/channel', this.videoRoute.router);
  }

}