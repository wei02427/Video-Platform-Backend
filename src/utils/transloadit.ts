// yarn add transloadit || npm i transloadit --save-exact
import stream from 'stream';
import TransloaditClient from 'transloadit'

const transloadit = new TransloaditClient({
    authKey: 'bd6148fff0dc40229ffa211e24acadca',
    authSecret: 'efddf27972bc103de45e57a1244391a200f42658'
})


// Start the Assembly

export async function Transcode(data: Buffer) {

    const readStream = new stream.PassThrough();
    readStream.end(data);
    // Set Encoding Instructions
    const options = {

        uploads: {
            'video': readStream
        },
        params: {
            steps: {
                ':original': {
                    robot: '/upload/handle',
                },
                p270_video: {
                    use: ':original',
                    robot: '/video/encode',
                    ffmpeg_stack: 'v4.3.1',
                    preset: 'dash-270p-video',
                    turbo: false,
                },
                p1080_video: {
                    use: ':original',
                    robot: '/video/encode',
                    ffmpeg_stack: 'v4.3.1',
                    preset: 'dash-1080p-video',
                    turbo: false,
                },
                b32k_audio: {
                    use: ':original',
                    robot: '/video/encode',
                    ffmpeg_stack: 'v4.3.1',
                    preset: 'dash-32k_audio',
                    turbo: false,
                },
                b64k_audio: {
                    use: ':original',
                    robot: '/video/encode',
                    ffmpeg_stack: 'v4.3.1',
                    preset: 'dash-64k_audio',
                    turbo: false,
                },
                adaptive: {
                    use: { 'steps': ['p270_video', 'p1080_video', 'b32k_audio', 'b64k_audio'], 'bundle_steps': true },
                    robot: '/video/adaptive',
                    ffmpeg_stack: 'v4.3.1',
                    playlist_name: 'iu.mpd',
                    technique: 'dash',
                },
                exported: {
                    use: [':original', 'adaptive'],
                    robot: '/google/store',
                    credentials: 'Google Storage',
                    acl: 'private',
                    path: 'dashtest/${file.meta.relative_path}/${file.name}',
                },
            }
        }
    }

    const result = await transloadit.createAssembly(options);
    console.log({ result })
}
