import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  imports: [ScheduleModule.forRoot()],
})
export class UserModule {}
