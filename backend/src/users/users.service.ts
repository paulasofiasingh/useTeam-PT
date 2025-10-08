import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el username ya existe
    const existingUser = await this.userModel.findOne({ 
      username: createUserDto.username 
    });
    
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const user = new this.userModel({
      ...createUserDto,
      isOnline: true,
      lastSeen: new Date(),
    });

    return user.save();
  }

  async findOne(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateOnlineStatus(username: string, isOnline: boolean, socketId?: string): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { username },
      { 
        isOnline, 
        lastSeen: new Date(),
        ...(socketId && { socketId })
      },
      { new: true }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAllOnline(): Promise<User[]> {
    return this.userModel.find({ isOnline: true }).exec();
  }

  async disconnectUser(socketId: string): Promise<User | null> {
    const user = await this.userModel.findOneAndUpdate(
      { socketId },
      { 
        isOnline: false, 
        lastSeen: new Date(),
        socketId: null
      },
      { new: true }
    );

    return user;
  }

  async generateRandomColor(): Promise<string> {
    const colors = [
      '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
      '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
