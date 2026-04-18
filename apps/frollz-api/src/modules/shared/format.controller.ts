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
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateFormatInput, UpdateFormatInput } from "@frollz/shared";
import { ApiZodBody } from "../../common/swagger/zod-swagger";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { FormatService } from "./application/format.service";

@ApiTags("Formats")
@Controller("formats")
export class FormatController {
  constructor(private readonly formatService: FormatService) {}

  @Get()
  @ApiOperation({ summary: "List all formats with their package type" })
  findAll() {
    return this.formatService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a format by id" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.formatService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a format" })
  @ApiZodBody(CreateFormatInput)
  create(
    @Body(new ZodValidationPipe(CreateFormatInput)) dto: CreateFormatInput,
  ) {
    return this.formatService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a format" })
  @ApiZodBody(UpdateFormatInput)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateFormatInput)) dto: UpdateFormatInput,
  ) {
    return this.formatService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a format" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.formatService.delete(id);
  }
}
