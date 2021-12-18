import { RouteBase } from '../../../base/route.base';
import { TodoController } from './todo.controller';

export class TodoRoute extends RouteBase {

  protected controller!: TodoController;

  constructor() {
    super();
  }

  protected initial(): void {
    this.controller = new TodoController();
    super.initial();
  }

  protected registerRoute(): void {
    this.router.get('/',  this.responseHandler(this.controller.getTodos));
  }

}