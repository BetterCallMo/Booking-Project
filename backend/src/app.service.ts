import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import {
  BookingDto,
  CreateEventDto,
  PatchEventDto,
  PatchUserDto,
} from './DTOs/DTOs';

import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  async get_user_info(@Req() req: any) {
    const userId = req.user?.id;
    const data = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: true,
      message: 'User info fetched successfully',
      data: data,
    };
  }

  async patch_user_info(body: PatchUserDto, @Req() req: any) {
    if (
      !Object.values(body).some(
        (value) => value !== undefined && value !== null,
      )
    ) {
      throw new BadRequestException('No data provided to update');
    }
    const userId = req.user?.id;
    if(body.email){
    const userWithRepeatedEmail = await this.prismaService.user.findUnique({ //checks if the new email is already used by another user and not the current user
      where: { email: body.email }, 
      select:{email:true,id:true}
    })
    if(userWithRepeatedEmail && userWithRepeatedEmail?.id != userId){
      throw new BadRequestException('Email already exists');
    }}
    const data = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        ...(body.email && { email: body.email }),
        ...(body.password && {
          password: await bcrypt.hash(body.password, 10),
        }),
        ...(body.name && { name: body.name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      success: true,
      message: 'User info patched successfully',
      data: data,
    };
  }
  async createEvent(passedEvent: CreateEventDto, req: any) {
    const userId = req.user?.id;
    if ( // validates the date, dumb way to do it but it kinda works at least, cause the other ways are too complicated 
      new Date(passedEvent.date) < new Date() ||
      new Date(passedEvent.date) > new Date('2030-12-31T22:00:00.000Z')
    ) {
      throw new BadRequestException('Date must be in a valid range');
    }

    const data = await this.prismaService.event.create({
      data: {
        title: passedEvent.title,
        description: passedEvent.description,
        date: new Date(passedEvent.date),
        capacity: passedEvent.capacity,
        location: passedEvent.location,
        organizer: { connect: { id: userId } },
      },
    });
    return {
      success: true,
      message: 'Event created successfully',
      data: data,
    };
  }
  async patch_event(passedEvent: PatchEventDto, req: any) {
    const userId = req.user?.id;
    const event = await this.prismaService.event.findUnique({
      where: {
        id: passedEvent.id,
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You cannot update this event');
    }

    if (passedEvent.date != null) {
      if ( //also validates the date, so bored to do a function for this so just copy pasted it
        new Date(passedEvent.date) < new Date() ||
        new Date(passedEvent.date) > new Date('2030-12-31T22:00:00.000Z')
      ) {
        throw new BadRequestException('Date must be in a valid range');
      }
    }
    const data = await this.prismaService.event.update({
      where: {
        id: passedEvent.id,
      },
      data: {
        ...(passedEvent.title && { title: passedEvent.title }),
        ...(passedEvent.description && {
          description: passedEvent.description,
        }),
        ...(passedEvent.date && { date: new Date(passedEvent.date) }),
        ...(passedEvent.capacity != null && { capacity: passedEvent.capacity }),
        ...(passedEvent.location && { location: passedEvent.location }),
      },
    });
    return {
      success: true,
      message: 'Event patched successfully',
      data: data,
    };
  }
  async delete_event(@Req() req: any, id: number) {
    const event = await this.prismaService.event.findUnique({
      where: {
        id: id,
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const userReqId = req.user?.id;
    if (event.organizerId != userReqId) { //only the organizer of the evet can delete his own event not any organizer
      throw new ForbiddenException('You cannot delete this event');
    } else {
      await this.prismaService.event.delete({
        where: {
          id: id,
        },
      });
    }
    return { success: true, message: 'Event deleted successfully' };
  }
  async book_event(booking: BookingDto, req: any) {
    const event = await this.prismaService.event.findUnique({
      where: {
        id: booking.eventId,
      },
      select: {
        organizerId: true,
        capacity: true,
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const userReqId = req.user?.id;
    if (userReqId == event.organizerId) { //organizer cannot book his own event
      throw new ForbiddenException('Organizer cannot book their own event');
    }

    const existingBooking = await this.prismaService.booking.findFirst({
      where: {
        eventId: booking.eventId,
        userId: userReqId,
      },
    });

    if (existingBooking) {
      throw new ForbiddenException('User already booked this event'); //user cannot book the same event more than once
    }
    const no_of_bookings = await this.prismaService.booking.count({
      where: {
        eventId: booking.eventId,
      },
    });
    if (event.capacity <= no_of_bookings) {
      throw new ForbiddenException('Event is fully booked'); //cannot book if the event is full
    }
    const data = await this.prismaService.booking.create({
      data: {
        userId: userReqId,
        eventId: booking.eventId,
      },
    });

    return {
      success: true,
      message: 'Event booked successfully',
      data: data,
      no_of_bookings: no_of_bookings + 1, //+1 because the booking is created after counting the bookings
    };
  }

  async cancel_booking(req: any, id: number) {
    const userReqId = req.user?.id;
    const booking = await this.prismaService.booking.findUnique({
      where: {
        id: id,
      },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId != userReqId) {
      throw new ForbiddenException('You cannot cancel this booking'); //only the user who made the booking can cancel it
    }
    const data = await this.prismaService.booking.delete({
      where: {
        id: id,
      },
    });
    const no_of_bookings = await this.prismaService.booking.count({
      where: {
        eventId: booking.eventId,
      },
    });
    return {
      success: true,
      message: 'Booking canceled successfully',
      data: data,
      no_of_bookings: no_of_bookings,
    };
  }
  async get_all_organizer_events(req: any) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: req.user?.id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const data = await this.prismaService.event.findMany({
      where: {
        organizerId: user.id,
      },
    });
    return {
      success: true,
      message: 'Events fetched successfully',
      data: data,
    };
  }

  async get_all_user_bookings(req: any) {
    const userId = req.user?.id;
    const data = await this.prismaService.booking.findMany({
      where: {
        userId,
      },
      include: {
        event: true,
      },
    });
    return {
      success: true,
      message: 'Bookings fetched successfully',
      data: data,
    };
  }
}
