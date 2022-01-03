import Ffmpeg from 'fluent-ffmpeg';
import tmp from 'tmp';
import fs from 'fs';


export const enum Bitrate {
    LOW_235K_240P = 235,
    MIDDLE_1050k_480P = 1050,
    HIGH_4300K_1080P = 4300
};

const scale = {
    [Bitrate.HIGH_4300K_1080P]: '1080',
    [Bitrate.MIDDLE_1050k_480P]: '480',
    [Bitrate.LOW_235K_240P]: '240'
}



export default function encodeMultiBitrate(data: Buffer, bitrates: Bitrate[]) {

    return new Promise<[tmp.FileResult[], tmp.FileResult]>((resolve, reject) => {
        // 紀錄每個步驟完成狀態
        const stepsFinish = Array<boolean>(bitrates.length + 1).fill(false);


        // video 和 videos 暫存檔案
        const audioTmp = tmp.fileSync({ postfix: '.m4a' });
        const videosTmp: tmp.FileResult[] = [];




        tmp.file(async function _tempFileCreated(err: any, path: any, fd: any, cleanupTmpCallback: () => void) {


            function setStepFinish(step: number) {

                stepsFinish[step] = true;

                if (stepsFinish.every((val) => val === true)) {
                    cleanupTmpCallback();
                    resolve([videosTmp, audioTmp]);
                }

            }

            if (err) reject(err);

            fs.appendFile(path, data, () => { });

            console.log('File: ', path);
            console.log('Filedescriptor: ', fd);




            // 產生不同解析度影片
            for (const [index, bitrate] of bitrates.entries()) {


                videosTmp.push(tmp.fileSync({ postfix: '.mp4' }));

                Ffmpeg({ source: path })
                    .setFfmpegPath(__dirname + '/ffmpeg')
                    .videoCodec('libx264').outputOptions([
                        '-y',
                        '-r 24',
                        `-x264opts keyint=48:min-keyint=48:no-scenecut`,
                        `-vf scale=-2:${scale[bitrate]}`,
                        `-b:v ${bitrate}k`,
                        `-maxrate ${bitrate}k`,
                        '-movflags faststart',
                        '-bufsize 8600k',
                        '-profile:v main',
                        '-preset fast'
                    ]).on('end', (_: any) => {

                        console.log('finish ' + bitrate);
                        setStepFinish(index);

                    }).on('error', (err, stdout, stderr) => {
                        reject(err);
                    }).noAudio().save(videosTmp[index].name)



            }

            // 抽出音檔
            Ffmpeg({ source: path })
                .setFfmpegPath(__dirname + '/ffmpeg')
                .outputOptions([
                    '-y',
                    '-map 0:1',
                    `-vn`,
                    `-c:a aac`,
                    `-b:a 128k`,
                    `-ar 48000`,
                    '-ac 2'
                ]).on('end', (_: any) => {
                    console.log('finish audio');

                    setStepFinish(bitrates.length);

                }).on('error', (err, stdout, stderr) => {
                    reject(err);
                })
                .save(audioTmp.name)

        });

    });
}