import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import type { StringValue } from "ms";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login-dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserEntity } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private secretKey: string;
  private accessTokenExpiry: StringValue;
  private refreshSecretKey: string;
  private refreshTokenExpiry: StringValue;
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {}
  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({ id: id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return await this.usersRepository.save(user);
  }

  async validateLogin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!password) throw new UnauthorizedException("Password is required");

    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ["profile"],
      select: ["id", "password", "email"],
    });

    if (!user?.password) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    return this.issueTokensAndBuildResponse(user, "Login successful");
  }

  private async issueTokensAndBuildResponse(user: any, message: string) {
    const token = this.generateToken(
      user,
      this.secretKey,
      this.accessTokenExpiry
    );
    const refreshToken = this.generateToken(
      user,
      this.refreshSecretKey,
      this.refreshTokenExpiry
    );

    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    return {
      message,
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        ...user,
        password: undefined,
      },
    };
  }

  private generateToken(
    user: Partial<UserEntity>,
    secretKey: string,
    expiry: StringValue
  ) {
    const issuedAt = Math.floor(Date.now() / 1000);

    return sign(
      {
        id: user?.id,
        email: user?.email,
        iat: issuedAt,
      },
      secretKey,
      {
        expiresIn: expiry,
      }
    );
  }
}
