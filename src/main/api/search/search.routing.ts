import { RouteBase } from '../../../base/route.base';
import fileUpload from 'express-fileupload';
import express from 'express';
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


        this.router.get('/video/:parm', this.responseHandler(this.controller.search));

    }



}