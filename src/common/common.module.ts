import { Global, Module } from "@nestjs/common";
import { UsersModule } from "src/modules/users/users.module";
import { AuthGuard } from "./guards/auth.guard";

@Global()
@Module({
  imports: [UsersModule],
  providers: [AuthGuard],
})
export class CommonModule {}
