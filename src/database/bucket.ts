import { Storage, Bucket as Storage_Bucket } from '@google-cloud/storage';


export default class Bucket {
    private static instance: Storage_Bucket;

    public static getInstance() {
        if (!this.instance) {
            const storage = new Storage({
                projectId: 'video-platform-335208',
                keyFilename: './src/database/video-platform-335208-95b4b183342d.json'
            });

            // Get a reference to the bucket
            this.instance = storage.bucket('video_platform');


        }
        return this.instance;
    }
}
// // Create a reference to a file object
// const file = myBucket.file('destFileName.mp4');

// // Create a pass through stream from a string
// const createReadStream = fs.createReadStream('C:/Users/wei14/Desktop/Youtube/Backend/assets/MV IU아이유  strawberry moon_1080p.mp4');


// export default async function streamFileUpload() {

//     await createReadStream.pipe(file.createWriteStream()).on('finish', () => {
//         console.log(' The file upload is complete')
//     });


// }

