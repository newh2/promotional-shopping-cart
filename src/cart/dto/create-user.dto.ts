import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserType)
  @IsNotEmpty({ message: 'O tipo do usuário (type) não pode ser vazio.' })
  type: UserType;
}
