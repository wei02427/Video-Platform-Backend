import io from 'socket.io';
import http from 'http';
import _ from 'lodash';


interface SocketBaseInterface {
    InitSocketEvent(socket: io.Socket): void
}
export default abstract class SocketBase {

    protected static socketIo = new io.Server();
    private static users: { uid: string, socketIds: string[] }[] = [];


    public static InitSocket(server: http.Server) {


        this.socketIo.listen(server, {
            cors: {
                origin: 'http://localhost:3001',
            }
        });



    }

    public abstract InitSocketEvent(socket: io.Socket): void
    public static RegisterSocketEvent(...initSocketEvents: ((socket: io.Socket) => void)[]) {


        this.socketIo.on('connection', function (socket) {

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
        // console.log(user)
        return user!.socketIds;
    }



}