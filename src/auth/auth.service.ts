import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role, RoleWithAdmin, SigninDto, SignupDto } from 'src/DTOs/DTOs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { config } from 'process';
//By frontend
import { BadRequestException, ConflictException } from '@nestjs/common';


@Injectable()
export class AuthService implements OnModuleInit {
  // runs every time the programs runs, - dumb way to create an admin and not secured at all i know but it makes the job done for now at least -
  constructor(
    private prismaService: PrismaService,
    private  jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async onModuleInit() {
    console.log(`The AuthModule has been initialized.`);
    const existingAdmin = await this.prismaService.user.findFirst({
      where: {
        role: 'ADMIN',
      },
    });
    if (!existingAdmin) {
      await this.prismaService.user.create({
        data: {
          name: this.configService.getOrThrow<string>('ADMIN_NAME') ,
          email: this.configService.getOrThrow<string>('ADMIN_EMAIL'),
          password: await bcrypt.hash(this.configService.getOrThrow<string>("ADMIN_PASSWORD"), 10),
          role: RoleWithAdmin.ADMIN,
        },
      });
    }
  }

  // exludes the password from the user object
  filter(user:any){ 
    const {password, ...filteredUser} = user;
    return filteredUser;
  }

  async signup(createUser: SignupDto) {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        email: createUser.email,
      },
    });
    if (existingUser == null) {
      const DbUser = this.prismaService.user.create({
        data: {
          name: createUser.name,
          email: createUser.email,
          password: await bcrypt.hash(createUser.password, 10),
          role: createUser.role || 'USER', // default to USER if no role is provided just like in the DB and DTOs
        },
      })
      const data = await this.filter(await DbUser); 
      return {success: true,message: 'User created successfully', data:data}
    } else {
      //By frontend
      throw new ConflictException('User already exists');
    }
  }

  async signin(signinDto: SigninDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        email: signinDto.email,
      },
    });

    if (user == null) {
      throw new NotFoundException('User not found');
    } else {
      if (await bcrypt.compare(signinDto.password, user.password)) {
        const { password, ...filterdPayload } = user;
        const token =  await this.jwtService.signAsync(filterdPayload); // returns a token that contains all the user info except the password
        return{success: true, message: 'Signin successful', token:token}
      } else {
        throw new UnauthorizedException('Invalid password');
      }
    }
  }

  async get_all() {
    const users = await this.prismaService.user.findMany({
      where: {
        role: {
          in: [Role.ORGANIZER, Role.USER],
        },
      },
    });

    if(users.length === 0) {
      throw new NotFoundException('There are no users or organizers available' );
    }
    return users.map((user) => {
      return this.filter(user)
    }); // returns every user or organizer without the password
  }
  async delete(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if(user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete an admin user');
    }
    const deletedUser = await this.prismaService.user.delete({
      where: { id },
    });
    const data = await this.filter(deletedUser);
    return {success: true,message: 'User deleted successfully', data:data};
  }

}
