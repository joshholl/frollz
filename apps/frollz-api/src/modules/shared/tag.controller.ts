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
import { CreateTagInput, UpdateTagInput } from "@frollz/shared";
import { ApiZodBody } from "../../common/swagger/zod-swagger";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { TagService } from "./application/tag.service";

@ApiTags("Tags")
@Controller("tags")
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: "List all tags" })
  findAll() {
    return this.tagService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a tag by id" })
  findById(@Param("id", ParseIntPipe) id: number) {
    return this.tagService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a tag" })
  @ApiZodBody(CreateTagInput)
  create(@Body(new ZodValidationPipe(CreateTagInput)) dto: CreateTagInput) {
    return this.tagService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a tag" })
  @ApiZodBody(UpdateTagInput)
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTagInput)) dto: UpdateTagInput,
  ) {
    return this.tagService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a tag" })
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.tagService.delete(id);
  }
}
