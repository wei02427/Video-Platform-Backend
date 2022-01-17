
import _ from "lodash";
import ElasticsearchModel from "../../../model/elasticsearch.model";

export default class SearchService {
    private esclient = new ElasticsearchModel();


    public async getVideos(parm: { text: string, page?: number, limit?: number }) {

        return await this.esclient.getVideos(parm);
    }

}

