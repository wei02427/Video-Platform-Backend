import io, { Socket } from 'socket.io';
import http from 'http';
import _ from 'lodash';
import { serialize, parse } from "cookie";
import type { SessionSocket } from '../model/account.model';

export default abstract class SocketBase {

    public static socketIo = new io.Server();
    private static users: { uid: string, socketIds: string[] }[] = [];


    public static InitSocket(server: http.Server) {

        this.socketIo.listen(server, {
            cors: {
                origin: 'http://localhost:3001',
                credentials: true,
            },
        });



    }

    public abstract InitSocketEvent(socket: SessionSocket): void

    // 註冊 socket event
    public static RegisterSocketEvent(...initSocketEvents: ((socket: SessionSocket) => void)[]) {

        this.socketIo.on('connection', function (defaultSocket) {
            const socket = <SessionSocket>defaultSocket;

            const init = _.flow(initSocketEvents);
            init(socket);

        });

    }


    public getUsers() {
        return SocketBase.users;
    }

    protected addUserSocketId(uid: string, socketId: string) {

        for (const user of SocketBase.users) {
            if (user.uid === uid) {
                if (!_.includes(user.socketIds, socketId))
                    user.socketIds.push(socketId);
                return;
            }
        };

        SocketBase.users.push({ uid, socketIds: [socketId] });


    }

    protected deleteSocketId(socketId: string) {

        _.forEach(SocketBase.users, user => {
            if (_.includes(user.socketIds, socketId)) {
                _.pull(user.socketIds, socketId);
                return;
            }
        }); 

    }

    protected getSocketsByUid(uid: number) {
        const user = _.find(SocketBase.users, ['uid', uid]);

        return user?.socketIds || [];
    }



}