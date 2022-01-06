import { spawn } from 'child_process';
import path from 'path';

export default function encodeDash(videos: { path: string, bitrate: string }[], audio: string, outputFolder: string){
    return new Promise<number | null > ((resolve, reject) => {
        const videoSource: string[] = [];

        for (const video of videos) {
            videoSource.push(`${video.path}#video:id=${video.bitrate}p`);
        }



        const child = spawn(`MP4Box`, [
            '-dash', '4000',
            '-frag', '4000',
            '-rap',
            '-segment-name', 'segment_$RepresentationID$_',
            '-fps', '24',
            ...videoSource,
            `${audio}#audio:id=soundtrack:role=main`,
            '-out', path.join(__dirname, '../../videos') + `/${outputFolder}/playlist.mpd`
        ])



        child.on('exit', (code) => {
            console.log(`Child process exited with code ${code}`);
            resolve(code);
        });

        child.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        child.on('error', (code) => {
            console.log(`Child process error with code ${code}`);
            reject(code);

        });

        child.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });


    });
}