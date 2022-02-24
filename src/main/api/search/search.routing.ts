import { RouteBase } from '../../../base/route.base';

import { SearchController } from './search.controller';
export default class SearchRoute extends RouteBase {

    protected controller!: SearchController;

    constructor() {
        super();
    }

    protected initial(): void {
        this.controller = new SearchController();
        super.initial();
    }

    protected registerRoute(): void {


        this.router.get('/videos/:parm', this.responseHandler(this.controller.search));

        this.router.get('/videos', this.responseHandler(this.controller.getRandomVideos));

    }



}