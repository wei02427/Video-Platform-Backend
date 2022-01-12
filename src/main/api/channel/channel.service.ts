import VideoModel from "../../../model/video.model";
import encodeMultiBitrate, { Bitrate } from "../../../utils/ffmpeg";
import tmp from 'tmp';
import encodeDash from "../../../utils/mp4box";

import fs from 'fs';
import path from "path";
import _ from "lodash";
import ChannelSocket from "./channel.socket";
export class VideoService {
    private videoModel = new VideoModel();

    private channelSocket = new ChannelSocket();

    public async upload(userID: number, title: string, description: string, folderName: string, video: Buffer, img: Buffer) {

        const bitrates = [Bitrate.LOW_235K_240P];
        const folderPath = path.join(__dirname, '../../../../videos');
        let videosTmp: tmp.FileResult[], audioTmp: tmp.FileResult;
        const stepProgress = { encodeMultiBitrate: 0, encodeDash: 0, upload: 0 };

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

                                if (uploadCount === mpegDashFiles.length) {
                                    this.channelSocket.emitUploadFinish(userID, folderName);
                                    this.videoModel.uploadVideoCover(img, folderName).then(() => resolve());

                                }

                            })
                            .catch(err => reject(err));

                    });



                })

            }).then(() => {

                this.videoModel.addVideoInfo(userID, title, description, folderName);
                // // 上傳後刪除資料夾
                fs.rmdir(path.join(folderPath, folderName), { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log(`${folderName} is deleted!`);
                });

            })
            .catch(err => {
                console.log(err);
            });


    }


    public async getVideo(hash: string, filename: string) {
        return await this.videoModel.getVideo(hash, filename);
    }

    public async getVideos(uid: number) {
        return await this.videoModel.getVideos(uid);
    }

    public async getVideoCover(hash: string) {
        return await this.videoModel.getVideoCover(hash);
    }

    public async deleteVideo(hash: string) {
        return await this.videoModel.deleteVideo(hash);
    }
}

