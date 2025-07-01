import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateProjectContactDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('clientId') clientId?: string,
    @Query('projectType') projectType?: string,
  ) {
    return this.projectsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      clientId,
      projectType,
    });
  }

  @Get('stats')
  getStats() {
    return this.projectsService.getStats();
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId') clientId: string) {
    return this.projectsService.findAll({ clientId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: 'draft' | 'active' | 'completed' | 'archived' }) {
    return this.projectsService.update(id, { status: body.status });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.projectsService.toggleActive(id);
  }

  // Project Contacts endpoints
  @Get(':id/contacts')
  getProjectContacts(@Param('id') projectId: string) {
    return this.projectsService.getProjectContacts(projectId);
  }

  @Post(':id/contacts')
  addProjectContact(@Param('id') projectId: string, @Body() contactDto: CreateProjectContactDto) {
    return this.projectsService.addProjectContact(projectId, contactDto);
  }

  @Patch(':id/contacts/:contactId')
  updateProjectContact(
    @Param('id') projectId: string,
    @Param('contactId') contactId: string,
    @Body() contactDto: Partial<CreateProjectContactDto>
  ) {
    return this.projectsService.updateProjectContact(projectId, contactId, contactDto);
  }

  @Delete(':id/contacts/:contactId')
  removeProjectContact(@Param('id') projectId: string, @Param('contactId') contactId: string) {
    return this.projectsService.removeProjectContact(projectId, contactId);
  }

  @Patch(':id/contacts/:contactId/set-primary')
  setPrimaryContact(@Param('id') projectId: string, @Param('contactId') contactId: string) {
    return this.projectsService.setPrimaryContact(projectId, contactId);
  }
} 