import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities';
import { Repository } from 'typeorm';

interface ConnectedClients {
    [id: string]: Client
}

interface Client {
    socket: Socket,
    user: User
}

@Injectable()
export class MessagesWsService {

    constructor(
        @InjectRepository( User )
        private readonly userRepository: Repository<User>
    ) {}

    private connectedClients: ConnectedClients = {}

    async registerClient( client: Socket, uid: string ) {

        const user = await this.userRepository.findOneBy({ id: uid })
        if ( !user ) throw new Error('User not found')
        if ( !user.isActive ) throw new Error('User is not active')

        this.connectedClients[client.id] = {
            socket: client,
            user
        }
    }

    removeClient( clientId: string) {
        delete this.connectedClients[clientId]
    }

    getConnectedClients(): string[] {
        return Object.keys( this.connectedClients )
    }

    getClientById( socketId: string ): Client {
        return this.connectedClients[socketId]
    }

    hasPreviusConnection( uid: string ) {
        const socketsId = this.getConnectedClients()

        for (const id of socketsId) {
            if (this.connectedClients[id].user.id === uid)
                this.connectedClients[id].socket.disconnect()
        }
    }
}
