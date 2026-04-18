import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { CreateCameraInput, UpdateCameraInput } from "@frollz/shared";
import { ApiZodBody } from "../../common/swagger/zod-swagger";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CameraService } from "./application/camera.service";

@ApiTags("Camera")
@Controller("cameras")
export class CameraController {
  constructor(private readonly cameraService: CameraService) {}

  @Get()
  @ApiOperation({ summary: "List all cameras with optional filters" })
  @ApiQuery({ name: "brand", required: false, type: String })
  @ApiQuery({ name: "model", required: false, type: String })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "active | retired | in_repair",
  })
  @ApiQuery({ name: "formatId", required: false, type: Number })
  @ApiQuery({
    name: "unloaded",
    required: false,
    type: Boolean,
    description: "Filter for cameras that are currently unloaded",
  })
  findAll(
    @Query("brand") brand?: string,
    @Query("model") model?: string,
    @Query("status") status?: "active" | "retired" | "in_repair",
    @Query("formatId", new ParseIntPipe({ optional: true })) formatId?: number,
    @Query("unloaded") unloaded?: boolean,
  ) {
    return this.cameraService.findAll({
      brand,
      model,
      status,
      formatId,
      unloaded,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a camera by id" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.cameraService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a camera" })
  @ApiZodBody(CreateCameraInput)
  create(
    @Body(new ZodValidationPipe(CreateCameraInput)) dto: CreateCameraInput,
  ) {
    return this.cameraService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a camera" })
  @ApiZodBody(UpdateCameraInput)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateCameraInput)) dto: UpdateCameraInput,
  ) {
    return this.cameraService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a camera" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.cameraService.delete(id);
  }
}
