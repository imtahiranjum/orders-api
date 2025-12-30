import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Public } from "src/modules/users/strategy/public.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import { LoginDto } from "./dto/login-dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.usersService.validateLogin(loginDto);
  }

  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { ...user, message: "User created successfully" };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
}
