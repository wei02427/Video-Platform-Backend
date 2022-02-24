


import { App } from './app';
import { DefaultException } from './exception/default.exception';
import Elasticsearch from './database/elasticsearch';
import { index } from './model/elasticsearch.model';
import dotenv from "dotenv";





(async () => {


    const esclient = Elasticsearch.getInstance();

    const elastic = new Elasticsearch();
    const isElasticReady = await elastic.checkConnection();

    dotenv.config();

    // 確保 Elasticsearch 啟動後再啟動 app
    if (isElasticReady) {

        const elasticIndex = await esclient.indices.exists({ index: index });

        if (!elasticIndex.body) {
            await elastic.createIndex(index);
            await elastic.setVideosMapping();
        }


        const app = new App();
        app.setException(DefaultException);
        app.bootstrap();

    }

})();


