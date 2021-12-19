import { RouteBase } from '../../base/route.base';
import { AccountRoute } from './account/account.routing';

export class AuthRoute extends RouteBase {

  private authAccountRoute !:AccountRoute;

  constructor() {
    super();
  }
  protected initial(): void {
    this.authAccountRoute = new AccountRoute();
    super.initial();
}
  protected registerRoute(): void {
    this.router.use('/auth', this.authAccountRoute.router);
  }

}