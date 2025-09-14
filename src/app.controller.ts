import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './auth/autheraization/role.decorator';
import { BookingDto, CreateEventDto, PatchEventDto, PatchUserDto, RoleWithAdmin } from './DTOs/DTOs';
import { RolesGuard } from './auth/autheraization/roles.guard';
import { JwtAuthGuard } from './auth/auth.header_checker';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/get_user_info")
  @UseGuards(JwtAuthGuard)
  get_user_info(@Req() req:any){
    return this.appService.get_user_info(req);
  }

  @Patch("/patch_user_info")
  @UseGuards(JwtAuthGuard)
  patch_user_info(@Body(ValidationPipe) body:PatchUserDto,@Req() req:any){
    return this.appService.patch_user_info(body,req);
  }
  @UseGuards(JwtAuthGuard,RolesGuard)
  //By frontend temp
  // @Roles(RoleWithAdmin.ORGANIZER)
  @Post("/create_event")
  create_event(@Body(ValidationPipe) createEventDto:CreateEventDto,@Req() req: any){
    return this.appService.createEvent(createEventDto,req)
  }
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleWithAdmin.ORGANIZER)
  @Patch("/patch_event")
  patch_event(@Body(ValidationPipe) patchEventDto: PatchEventDto, @Req() req: any) {
    return this.appService.patch_event(patchEventDto, req);
  }
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleWithAdmin.ORGANIZER)
  @Delete("/delete_event/:id")
  delete_event(@Req() req: any, @Param("id",ParseIntPipe) id : number){ {
    return this.appService.delete_event(req,id);
  } }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleWithAdmin.USER,RoleWithAdmin.ORGANIZER)
  @Post("/book_event")
  book_event(@Body(ValidationPipe) booking:BookingDto,@Req() req:Request){
    return this.appService.book_event(booking,req)
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleWithAdmin.USER,RoleWithAdmin.ORGANIZER)
  @Delete("/cancel_booking/:id")
  cancel_booking(@Req() req: any, @Param("id",ParseIntPipe) id : number){
    return this.appService.cancel_booking(req,id);
}
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RoleWithAdmin.ORGANIZER,RoleWithAdmin.ADMIN)
@Get("get_all_organizer_events")
get_all_organizer_events(@Req() req:any){
    return this.appService.get_all_organizer_events(req);
}


@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(RoleWithAdmin.USER,RoleWithAdmin.ADMIN)
@Get("get_all_user_bookings")
get_all_user_bookings(@Req() req:any){
    return this.appService.get_all_user_bookings(req);
} 
}