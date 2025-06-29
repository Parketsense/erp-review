import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UploadedFiles,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// File type validation
const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const documentTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
const model3dTypes = ['.obj', '.fbx', '.gltf', '.glb', '.3ds', '.max', '.blend'];
const textureTypes = ['.jpg', '.jpeg', '.png', '.tga', '.bmp', '.hdr', '.exr'];

const fileFilter = (req: any, file: any, cb: any) => {
  const mediaType = req.body.mediaType;
  const fileExt = extname(file.originalname).toLowerCase();
  
  let allowedTypes: string[] = [];
  
  switch (mediaType) {
    case 'images':
      allowedTypes = imageTypes;
      break;
    case 'documents':
      allowedTypes = documentTypes;
      break;
    case 'models3d':
      allowedTypes = model3dTypes;
      break;
    case 'textures':
      allowedTypes = textureTypes;
      break;
    default:
      allowedTypes = [...imageTypes, ...documentTypes, ...model3dTypes, ...textureTypes];
  }
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type ${fileExt} not allowed for ${mediaType}`), false);
  }
};

// Multer configuration for file uploads
const storage = diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = extname(file.originalname);
    const filename = `${timestamp}_${random}_${file.originalname}`;
    cb(null, filename);
  },
});

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post(':id/upload')
  @UseInterceptors(FilesInterceptor('files', 20, { storage, fileFilter }))
  async uploadFiles(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('mediaType') mediaType: string
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (!['images', 'documents', 'models3d', 'textures'].includes(mediaType)) {
      throw new BadRequestException('Invalid media type');
    }

    return this.productsService.addMediaFiles(id, files, mediaType);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('inStock') inStock?: string,
    @Query('isFeatured') isFeatured?: string,
  ) {
    return this.productsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      category,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
    });
  }

  @Get('stats')
  getStats() {
    return this.productsService.getStats();
  }

  @Get('check-code/:code')
  checkCode(@Param('code') code: string) {
    return this.productsService.checkCode(code);
  }

  @Get('test-simple')
  testSimple() {
    return { message: 'Simple test endpoint works' };
  }

  @Get('test-delete/:id')
  testDelete(@Param('id') id: string) {
    return { message: 'Test delete endpoint works', id };
  }

  @Delete(':id/media/:mediaType/:filename')
  async removeMediaFile(
    @Param('id') id: string,
    @Param('mediaType') mediaType: string,
    @Param('filename') filename: string
  ) {
    console.log('Delete media file called:', { id, mediaType, filename });
    return this.productsService.removeMediaFile(id, mediaType, filename);
  }

  @Patch(':id/video-url')
  async updateVideoUrl(
    @Param('id') id: string,
    @Body('videoUrl') videoUrl: string
  ) {
    return this.productsService.updateVideoUrl(id, videoUrl);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productsService.findOne(id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const product = await this.productsService.toggleActive(id);
    
    return {
      success: true,
      data: product,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
} 