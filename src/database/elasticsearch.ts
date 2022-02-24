import { Client } from "@elastic/elasticsearch";
import { index, type } from "../model/elasticsearch.model";





export default class Elasticsearch {
    private static instance: Client;

    public static getInstance() {
        if (!this.instance) {
            const elasticUrl = process.env.ELASTIC_URL || "http://localhost:9200";
            this.instance = new Client({ node: elasticUrl });
        }
        return this.instance;

    }


    // 定義資料表 index = table
    public async createIndex(index: string) {
        try {

            await Elasticsearch.instance.indices.create({ index });
            console.log(`Created index ${index}`);

        } catch (err) {

            console.error(`An error occurred while creating the index ${index}:`);
            console.error(err);

        }
    }

    // 定義欄位名稱 & 類型 mapping = schema
    public async setVideosMapping() {
        try {
            const schema = {
                title: {
                    type: "search_as_you_type"
                },
                description: {
                    type: "text"
                }
            };

            await Elasticsearch.instance.indices.putMapping({
                index,
                type,
                include_type_name: true,
                body: {
                    properties: schema
                }
            })

            console.log("Videos mapping created successfully");

        } catch (err) {
            console.error("An error occurred while setting the Videos mapping:");
            console.error(err);
        }
    }

    public checkConnection() {
        return new Promise(async (resolve) => {

            console.log("Checking connection to ElasticSearch...");
            let isConnected = false;

            while (!isConnected) {
                try {

                    await Elasticsearch.instance.cluster.health({});
                    console.log("Successfully connected to ElasticSearch");
                    isConnected = true;

                    // eslint-disable-next-line no-empty
                } catch (_) {

                }
            }

            resolve(true);

        });
    }

}