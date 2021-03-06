import { Storage, Bucket as Storage_Bucket } from '@google-cloud/storage';


export default class Bucket {
    private static instance: Storage_Bucket;

    public static getInstance() {
        if (!this.instance) {
            const storage = new Storage({
                projectId: process.env.PROJECT_ID,
                keyFilename: './src/database/video-platform-335208-95b4b183342d.json'
            });


            this.instance = storage.bucket('video_platform');


        }
        return this.instance;
    }


}
