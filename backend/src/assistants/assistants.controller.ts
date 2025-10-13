import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssistantsService } from './assistants.service';
import { CreateAssistantDto } from './dto/create-assistant.dto';
import { UpdateAssistantDto } from './dto/update-assistant.dto';

@Controller('rag')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) { }

  @Get('stats')
  async getAssistantStats(
    @Query('granularity') granularity: 'per_day' | 'per_month' | 'per_year',
    // @Query('month') month?: number,
    // @Query('year') year?: number,
  ) {
    // validate granularity
    if (!granularity) {
      return { error: 'granularity is required (per_day or per_month)' };
    }

    // Call service
    const data = await this.assistantsService.getAssistantStatistics(granularity);

    return {
      // month: month || null,
      // year: year || null,
      data,
    };
  }

  @Get('activity-stats')
  async getAssistantsActivity() {
    return await this.assistantsService.getAssistantsStatusCounts();
  }

  @Get('total-assistants')
  async getTotalAssistants() {
    return await this.assistantsService.getTotalAssistants();
  }

  @Post()
  create(@Body() createAssistantDto: CreateAssistantDto) {
    return this.assistantsService.create(createAssistantDto);
  }

  @Get()
  findAll(@Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,) {

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    return this.assistantsService.findAll(pageNumber, limitNumber, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assistantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAssistantDto: UpdateAssistantDto) {
    return this.assistantsService.update(id, updateAssistantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assistantsService.remove(id);
  }

  @Post('filter')
  async getFilteredAssistants(@Body() filters: any, @Query('page') page: string,
    @Query('limit') limit: string,) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    return this.assistantsService.getFilteredAssistants(pageNumber, limitNumber, filters);
  }

  @Get('user/exists')
  async checkUserExists(@Query('username') username: string): Promise<{ exists: boolean }> {
    const exists = await this.assistantsService.getUserByUsername(username);
    console.log(username);
    return { exists };
  }






}
