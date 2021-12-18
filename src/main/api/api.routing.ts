import { RouteBase } from '../../base/route.base';
import { TodoRoute } from './todo/todo.routing';

export class ApiRoute extends RouteBase {

  private todoRoute !:TodoRoute;

  constructor() {
    super();
  }
  protected initial(): void {
    this.todoRoute = new TodoRoute();
    super.initial();
}
  protected registerRoute(): void {
    this.router.use('/todo', this.todoRoute.router);
  }

}