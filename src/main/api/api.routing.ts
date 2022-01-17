import { RouteBase } from '../../base/route.base';
import { VideoRoute } from './channel/channel.routing';
import SearchRoute from './search/search.routing';

export class ApiRoute extends RouteBase {

  private videoRoute !: VideoRoute;
  private searchRoute !: SearchRoute;
  constructor() {
    super();
  }
  protected initial(): void {
    this.videoRoute = new VideoRoute();
    this.searchRoute = new SearchRoute();
    super.initial();
  }
  protected registerRoute(): void {
    this.router.use('/channel', this.videoRoute.router);
    this.router.use('/search', this.searchRoute.router);
  }

}