import { Module, forwardRef } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { UsersModule } from '../users/users.module';
import { ColumnsModule } from '../columns/columns.module';

@Module({
  imports: [UsersModule, forwardRef(() => ColumnsModule)],
  providers: [WebSocketGateway],
  exports: [WebSocketGateway],
})
export class WebSocketModule {}
