import io from 'socket.io';
import http from 'http';
import _ from 'lodash';
import SocketBase from '../../../base/socket.base';
import Autobind from '../../../utils/autobind';
import { SessionSocket } from '../../../model/account.model';

export default class ChannelSocket extends SocketBase {



    @Autobind
    public InitSocketEvent(socket: SessionSocket) {

    }

    public emitUploadProgress(uid: number, progress: number) {

        const socketIds = this.getSocketsByUid(uid);
        _.forEach(socketIds, id => {
            console.log('emitUploadProgress', id)
            SocketBase.socketIo.to(id)
                .emit('upload_progress', progress);
        });
    }

    public emitUploadFinish(uid: number, vid: string) {
        const socketIds = this.getSocketsByUid(uid);
        _.forEach(socketIds, id => {
            SocketBase.socketIo.to(id)
                .emit('upload_finish', vid);
        });
    }

    public emitSubscriber(uids: number[], videoInfo: { vid: string, title: string, channel: string }) {


        _.forEach(uids, uid => {
            const socketIds = this.getSocketsByUid(uid);

            _.forEach(socketIds, id => {

                SocketBase.socketIo.to(id)
                    .emit('new_video', videoInfo)
            })

        });

    }


}