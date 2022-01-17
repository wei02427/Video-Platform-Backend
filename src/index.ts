


import { App } from './app';
import { DefaultException } from './exception/default.exception';
import Elasticsearch from './database/elasticsearch';
import { index, type } from './model/elasticsearch.model';


const esAction = {
    index: {
        _index: index,
        _type: type
    }
};


const bootstrap = async () => {


    const esclient = Elasticsearch.getInstance();

    const elastic = new Elasticsearch();
    const isElasticReady = await elastic.checkConnection();


    if (isElasticReady) {

        const elasticIndex = await esclient.indices.exists({ index: index });

        // console.log(elasticIndex.body)
        if (!elasticIndex.body) {
            await elastic.createIndex(index);
            await elastic.setQuotesMapping(); 
        }


        const app = new App();
        app.setException(DefaultException);
        app.bootstrap();

    }

};

bootstrap();
