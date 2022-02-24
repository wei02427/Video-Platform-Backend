
import _ from "lodash";
import ElasticsearchModel from "../../../model/elasticsearch.model";
import VideoModel from "../../../model/video.model";

export default class SearchService {
    private esclient = new ElasticsearchModel();
    private videoModel = new VideoModel();

    public async searchVideos(parm: { text: string, page?: number, limit?: number }) {

        return await this.esclient.searchVideos(parm);
    }

    public async getRandomVideos() {
        return await this.videoModel.getRandomVideos();
    }
}

