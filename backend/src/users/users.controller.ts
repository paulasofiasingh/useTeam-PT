import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly webSocketGateway: WebSocketGateway
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    // Si no se proporciona color, generar uno aleatorio
    if (!createUserDto.color) {
      createUserDto.color = await this.usersService.generateRandomColor();
    }
    
    return this.usersService.create(createUserDto);
  }

  @Get('online')
  async findAllOnline() {
    return this.webSocketGateway.getConnectedUsers();
  }

  @Get(':username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }
}
