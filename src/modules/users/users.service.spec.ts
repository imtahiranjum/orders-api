import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { UserEntity } from "./entities/user.entity";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("UsersService", () => {
  let service: UsersService;
  let repo: Repository<UserEntity>;

  const mockUserRepo = {
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    preload: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(UserEntity));

    // set private fields (normally from config)
    (service as any).secretKey = "access-secret";
    (service as any).refreshSecretKey = "refresh-secret";
    (service as any).accessTokenExpiry = "1h";
    (service as any).refreshTokenExpiry = "7d";
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("creates a user", async () => {
      const dto = { email: "test@test.com", password: "hashed" };
      mockUserRepo.save.mockResolvedValue(dto);

      const result = await service.create(dto as any);

      expect(repo.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  describe("findOne", () => {
    it("finds user by id", async () => {
      const user = { id: "1" };
      mockUserRepo.findOneBy.mockResolvedValue(user);

      const result = await service.findOne("1");

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: "1" });
      expect(result).toBe(user);
    });
  });

  describe("update", () => {
    it("updates existing user", async () => {
      const user = { id: "1", email: "a@test.com" };
      mockUserRepo.preload.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.update("1", { email: "b@test.com" } as any);

      expect(repo.preload).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledWith(user);
      expect(result).toBe(user);
    });

    it("throws error if user not found", async () => {
      mockUserRepo.preload.mockResolvedValue(null);

      await expect(
        service.update("1", { email: "x@test.com" } as any),
      ).rejects.toThrow("User with ID 1 not found");
    });
  });

  describe("validateLogin", () => {
    it("throws if password missing", async () => {
      await expect(
        service.validateLogin({ email: "a@test.com" } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("throws on invalid credentials", async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.validateLogin({
          email: "a@test.com",
          password: "123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("throws on password mismatch", async () => {
      mockUserRepo.findOne.mockResolvedValue({
        id: "1",
        email: "a@test.com",
        password: "hashed",
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateLogin({
          email: "a@test.com",
          password: "wrong",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("returns tokens on successful login", async () => {
      const user = {
        id: "1",
        email: "a@test.com",
        password: "hashed",
      };

      mockUserRepo.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("jwt-token");
      mockUserRepo.save.mockResolvedValue(user);

      const result = await service.validateLogin({
        email: "a@test.com",
        password: "123",
      });

      expect(result.accessToken).toBe("jwt-token");
      expect(result.refreshToken).toBe("jwt-token");
      expect(result.user.password).toBeUndefined();
      expect(repo.save).toHaveBeenCalled();
    });
  });
});
