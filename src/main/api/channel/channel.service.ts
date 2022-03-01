import VideoModel from "../../../model/video.model";
import encodeMultiBitrate, { Bitrate } from "../../../utils/ffmpeg";
import tmp from 'tmp';
import encodeDash from "../../../utils/mp4box";
import fs from 'fs';
import path from "path";
import _ from "lodash";
import ChannelSocket from "./channel.socket";
import ElasticsearchModel from "../../../model/elasticsearch.model";
import AccountModel from "../../../model/account.model";
export class ChannelService {
    private videoModel = new VideoModel();
    private searchModel = new ElasticsearchModel();
    private accountModel = new AccountModel();
    private channelSocket = new ChannelSocket();


    public async upload(user: Express.User, title: string, description: string, folderName: string, video: Buffer, img: Buffer) {

        const bitrates = [Bitrate.LOW_235K_240P];
        const folderPath = path.join(__dirname, '../../../../videos');
        let videosTmp: tmp.FileResult[], audioTmp: tmp.FileResult;
        const stepProgress = { encodeMultiBitrate: 0, encodeDash: 0, upload: 0 };
        const userID = user.id!;


        const updateProgress = (progress: number, step: 'encodeMultiBitrate' | 'encodeDash' | 'upload') => {
            stepProgress[step] = progress * 0.25;
            const totalProgress = _.reduce(stepProgress, function (result, value, key) {
                result += value;
                return result;
            }, 0);

            this.channelSocket.emitUploadProgress(userID, totalProgress);


        }

        // 轉成不同畫質
        encodeMultiBitrate(video, bitrates, updateProgress.bind(this))

            .then((files: [tmp.FileResult[], tmp.FileResult]) => {

                [videosTmp, audioTmp] = files;


                const videosSource = videosTmp.map(((video, index) => ({ path: video.name, bitrate: bitrates[index].toString() })));

                // 產生 dash 檔
                return encodeDash(videosSource, audioTmp.name, folderName, updateProgress.bind(this));

            })
            .then(code => {
                // 遍歷資料夾檔案上傳
                return new Promise<void>((resolve, reject) => {
                    audioTmp.removeCallback();
                    videosTmp.forEach(video => video.removeCallback());


                    const mpegDashFiles = fs.readdirSync(path.join(folderPath, folderName));

                    let uploadCount = 0;

                    mpegDashFiles.forEach((filename, index) => {

                        this.videoModel.uploadDashFile(folderPath, folderName, filename)
                            .then(() => {
                                uploadCount++;

                                updateProgress(uploadCount / mpegDashFiles.length * 100, 'upload');
                                // console.log(uploadCount, mpegDashFiles.length, filename);
                                if (uploadCount === mpegDashFiles.length) {
                                    this.channelSocket.emitUploadFinish(userID, folderName);
                                    this.videoModel.uploadVideoCover(img, folderName).then(() => resolve());

                                }

                            })
                            .catch(err => {
                                reject(err);


                            });

                    });



                })

            })
            // 插入新資料到　table
            .then(() => {
                return this.videoModel.addVideoInfo(userID, title, description, folderName);
            })
            // 插入新資料到　elasticsearch
            .then(() => {
                return this.searchModel.insertNewVideo(title, description, folderName);
            })
            // 上傳後刪除資料夾
            .then(() => {

                fs.rmdir(path.join(folderPath, folderName), { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${folderName} is deleted!`);
                });

            })
            .then(async () => {
                const subscribers = await this.accountModel.getSubscribesByID(userID);
                console.log('emit subscriber');
                this.channelSocket.emitSubscriber(subscribers, { vid: folderName, title: title, channel: user.name });
            })
            .catch(err => {
                console.log('Upload Error', err);
            });


    }


    public async getVideo(hash: string, filename: string) {
        return await this.videoModel.getVideo(hash, filename);
    }

    public async getVideosByUid(uid: number) {
        return await this.videoModel.getVideosByUid(uid);
    }

    public async getVideoCover(hash: string) {
        return await this.videoModel.getVideoCover(hash);
    }

    public async getVideoInfo(hash: string) {
        return await this.videoModel.getVideoInfo(hash);
    }

    public async deleteVideo(hash: string) {
        return this.videoModel.deleteVideo(hash)
            .then(result => {
                // console.log(result);
                this.searchModel.removeVideo(hash);
            });
    }

    public async checkSubscriber(uid: number, channelID: number) {
        return await this.accountModel.checkIsSubscriber(uid, channelID);
    }


    public async getChannelName(uid: number) {

        const info = await this.accountModel.getAccountByID(uid);
        return info?.name;
    }
}

