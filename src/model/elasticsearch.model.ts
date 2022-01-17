import _ from "lodash";
import Elasticsearch from "../database/elasticsearch"

export const index = "videos";
export const type = "video";



export default class ElasticsearchModel {
    private esclient = Elasticsearch.getInstance();

    public async getVideos(parm: { text: string, page?: number, limit?: number }) {

        const query = {
            query: {
                multi_match: {
                    query: parm.text,
                    fields: ["title", "description"],
                    operator: "or"
                }

            }
        }

        const { body: { hits } } = await this.esclient.search({
            from: parm.page || 0,
            size: parm.limit || 100,
            index: index,
            type: type,
            body: query
        });

        const results = hits.total.value;
        const values = hits.hits.map((hit: any) => {
            return {
                id: hit._id,
                title: hit._source.title,
                description: hit._source.description,
                score: hit._score
            }
        });

        return {
            results,
            values
        }

    }

    public async insertNewVideo(title: string, description: string, vid: string) {

        return this.esclient.index({
            index,
            type,
            id: vid,
            body: {
                title,
                description
            }
        })
    }


    public async removeVideo(vid: string) {

        return this.esclient.delete({
            index,
            type,
            id: vid,
        })
    }
}