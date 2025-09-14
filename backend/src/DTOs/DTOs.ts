import { Transform, Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, IsEnum, IsOptional, MinLength, IsNumber, IsDateString, IsDate, Min, Max, min, MaxLength } from 'class-validator';

export enum Role {
    USER = 'USER',
    ORGANIZER = 'ORGANIZER'
}
export enum RoleWithAdmin {
    USER = 'USER',
    ORGANIZER = 'ORGANIZER',
    ADMIN = 'ADMIN'
}


export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6) 
  password: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;
  @IsOptional()
  @IsEnum(Role)
  role?: Role; // The '?' makes it optional
}

export class PatchUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsOptional()
  @IsString()
  @MinLength(6) 
  password?: string;
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;
}


export class SigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1000000000)
  capacity: number; 
}


export class PatchEventDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000000000)
  capacity?: number;
}


export class BookingDto{
  @IsNotEmpty()
  @IsNumber()
  eventId : number
}





