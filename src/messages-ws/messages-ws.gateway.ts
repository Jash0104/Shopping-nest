import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  },
  transport: ["websocket", 'polling']
})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}
  
  async handleConnection(client: Socket, ...args: any[]) {

    const token = client.handshake.headers.auth as string
    let payload: JwtPayload

    try {
      payload = this.jwtService.verify( token )
      
      this.messagesWsService.hasPreviusConnection( payload.id )

      await this.messagesWsService.registerClient( client, payload.id )
    } catch (error) {
      client.emit('invalid-token')
      client.disconnect()
      return 
    }
    

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    console.log(this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient( client.id )
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())

  }

  @SubscribeMessage('message-from-client')
  onClientMessage(client: Socket, payload: NewMessageDto) {

    const { user }= this.messagesWsService.getClientById( client.id )

    //* Emite a todos los clientes
    this.wss.emit('message-from-server', { message: payload.message , user: user.fullName, id: client.id })


    //* Emite a todos excepto el cliente inicial
    // client.broadcast.emit('message-from-server', payload)

    //* Emite solo al cliente inicial
    // client.emit('message-from-server', payload)
  }

  
}
