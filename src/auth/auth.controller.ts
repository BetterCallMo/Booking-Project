import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { SignupDto,SigninDto, Role, RoleWithAdmin } from 'src/DTOs/DTOs';
import { AuthService } from './auth.service';
import { RolesGuard } from './autheraization/roles.guard';
import { Roles } from './autheraization/role.decorator';
import { JwtAuthGuard } from './auth.header_checker';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

@Post('/signup')
signup (@Body(ValidationPipe) createUser: SignupDto) {
    return this.authService.signup(createUser);
}

@Post('/signin')
signin(@Body(ValidationPipe) signinDto: SigninDto) {
    return this.authService.signin(signinDto);
}

@UseGuards(JwtAuthGuard)
@Get('/logout')
logout(@Request() req) {
    return req.user;
}

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RoleWithAdmin.ADMIN)
@Get("/get_all") //only for admins, gets all the users and organizers
getAllUsers() {
    return this.authService.get_all();
}
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RoleWithAdmin.ADMIN)
@Delete('/:id')
delete(@Param('id',ParseIntPipe) id: number) {
    return this.authService.delete(id);
} }
