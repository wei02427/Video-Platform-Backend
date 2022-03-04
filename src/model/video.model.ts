import Bucket from "../database/bucket";
import Database from "../database/database";
import moment from 'moment';
import imageType from 'image-type';
import path from "path";

export interface Video {
    ID?: number;
    title: string;
    description: string;
    hash: string;
    uid: number;
    upload_date: string;
}



export default class VideoModel {
    private Videos = (Database.getInstance())<Video>('Videos');
    private bucket = Bucket.getInstance();


    public async addVideoInfo(userID: number, title: string, description: string, folderName: string) {


        return await this.Videos.clone().insert({ uid: userID, title, description, hash: folderName, upload_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss') });
    }

    public uploadDashFile(folderPath: string, folderName: string, filename: string) {

        return this.bucket.upload(path.join(folderPath, folderName, filename), {
            resumable: false,
            validation: false,
            destination: folderName + '/' + filename,
        });

    }

    public uploadVideoCover(cover: Buffer, folderName: string) {

        const file = this.bucket.file(`${folderName}/cover.${imageType(cover)?.ext}`);
        return file.save(cover);

    }


    public async getVideo(hash: string, filename: string) {


        try {
            const file = this.bucket.file(hash + '/' + filename);

            const [metaData] = await file.getMetadata();

            return [file, metaData];
        } catch (e) {
            console.log(`getVideo not found: ${hash}/${filename}`);
            return null;
        }


    }


    public async getVideoInfo(hash: string) {

        const knex = Database.getInstance();
        const info = await this.Videos.clone()
            .where('hash', '=', hash)
            .innerJoin('accounts', 'accounts.id', 'videos.uid')
            .select('title', 'description', 'upload_date', knex.raw(`accounts.id  as "uid"`), knex.raw(`accounts.name  as "name"`))
            .first();

        return info;

    }

    public async getVideoCover(hash: string) {

        const [files] = await this.bucket.getFiles({ prefix: `${hash}/cover`, delimiter: '/' });

        const [metaData] = await files[0].getMetadata();

        return [files[0], metaData];

    }

    public async getVideosByUid(uid: number) {

        const result = await this.Videos.clone().select('title', 'hash', 'description', 'upload_date').where('uid', '=', uid);
        return result;

    }

    public async deleteVideo(hash: string) {

        return new Promise<number>((reslove, reject) => {
            this.bucket.deleteFiles({ prefix: `${hash}/` })
                .then(() => {
                    this.Videos.clone().delete().where('hash', '=', hash)
                        .then(res => reslove(res))
                        .catch(err => reject(err));
                }).catch(err => {
                    reject(err);
                });

        })

    }

    public async getRandomVideos(limit = 100) {

        const result = await this.Videos.clone().select('hash', 'title', 'description', 'upload_date').orderByRaw('RAND()').limit(limit);

        return result;
    }
};