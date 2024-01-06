import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './interfaces/message.interface';
import { Room } from './interfaces/room.interface';
import { ClientProxy } from '@nestjs/microservices';
import { Chat } from './interfaces/chat.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Room') private readonly roomModel: Model<Room>,
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  async createRoom(userIds: string[]): Promise<Room | null> {
    const room = await this.roomModel
      .findOne({
        users: { $all: userIds },
      })
      .exec();
    if (room) {
      console.log('room found');
      return room;
    }
    const newRoom = new this.roomModel({
      users: userIds,
    });
    const newroom = await newRoom.save();
    console.log('new room created');
    return newroom;
  }

  async getMessage(roomId: string): Promise<Message[]> {
    const room = await this.roomModel.findOne({ _id: roomId }).exec();
    if (!room) {
      return [];
    }
    return room.message;
  }

  async getList(userId: string): Promise<Chat[]> {
    const rooms = await this.roomModel
      .find({ users: { $in: [userId] } })
      .exec();
    const profileIds = rooms.map((room) => {
      return room.users.filter((user) => user !== userId)[0];
    });
    const names: { id: string; name: string }[] = await firstValueFrom(
      this.userService.send('get-profile-names', profileIds),
    );
    const result = rooms.map((room) => {
      const proIds = room.users.filter((user) => user !== userId);
      return {
        name: names.map((name) => {
          if (name.id === proIds[0]) {
            return name.name;
          }
        }),
        profileId: proIds,
        lastMesage: room.lastMessage,
      } as Chat;
    });
    return result;
  }

  async saveMessage(message: Message): Promise<boolean> {
    const room = await this.roomModel.findOne({ _id: message.roomId }).exec();
    if (!room) return false;
    room.lastMessage = message.text;
    const tempMsg = { ...message };
    delete tempMsg.roomId;
    console.log(tempMsg);
    room.message.push(message);
    await room.save();
    return true;
  }

  // async joinRoom(data: JoinRoomDto): Promise<void> {
  //   const room = await this.roomModel.findOne({ _id: data.roomId });
  //   if (!room) {
  //     return;
  //   }
  //   if (!room.users.includes(data.userId)) {
  //     room.users.push(data.userId);
  //   }
  //   await room.save();
  // }
}
