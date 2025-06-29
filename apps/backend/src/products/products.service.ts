import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId?: string) {
    // Check for existing code
    const existingProduct = await this.prisma.product.findFirst({
      where: { code: createProductDto.code },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this code already exists');
    }

    // Calculate prices with proper profit margin formula
    const costBgn = createProductDto.costBgn || (createProductDto.costEur ? createProductDto.costEur * 1.956 : 0);
    const costEur = createProductDto.costEur || (createProductDto.costBgn ? createProductDto.costBgn / 1.956 : 0);
    const markup = createProductDto.markup || 30;
    
    // Profit margin formula: Sale = Cost ÷ ((100 - margin) / 100)
    const saleBgn = createProductDto.saleBgn || (costBgn > 0 ? costBgn / ((100 - markup) / 100) : 0);
    const saleEur = createProductDto.saleEur || (costEur > 0 ? costEur / ((100 - markup) / 100) : 0);

    const product = await this.prisma.product.create({
      data: {
        code: createProductDto.code,
        nameBg: createProductDto.nameBg,
        nameEn: createProductDto.nameEn || createProductDto.nameBg,
        productTypeId: createProductDto.productTypeId,
        manufacturerId: createProductDto.manufacturerId,
        supplier: createProductDto.supplier,
        unit: createProductDto.unit || 'm2',
        packageSize: createProductDto.packageSize,
        costEur: costEur,
        costBgn: costBgn,
        saleBgn: saleBgn,
        saleEur: saleEur,
        markup: markup,
        isActive: createProductDto.isActive !== false,
        isRecommended: createProductDto.isRecommended || false,
        isNew: createProductDto.isNew !== false,
        // Media fields
        images: createProductDto.images || [],
        documents: createProductDto.documents || [],
        models3d: createProductDto.models3d || [],
        textures: createProductDto.textures || [],
        videoUrl: createProductDto.videoUrl,
        ...(userId && { createdById: userId }),
      },
      include: {
        productType: {
          select: {
            nameBg: true,
            nameEn: true,
          },
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create attribute values if provided
    if (createProductDto.attributes && createProductDto.attributes.length > 0) {
      const attributeData = createProductDto.attributes.map(attr => ({
        productId: product.id,
        attributeTypeId: attr.attributeTypeId,
        attributeValueId: attr.attributeValueId,
        customValue: attr.customValue,
      }));

      await this.prisma.productAttributeValue.createMany({
        data: attributeData,
      });
    }

    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (options.search) {
      where.OR = [
        { nameBg: { contains: options.search } },
        { nameEn: { contains: options.search } },
        { code: { contains: options.search } },
        { supplier: { contains: options.search } },
      ];
    }

    if (options.isFeatured !== undefined) where.isRecommended = options.isFeatured;
    where.isActive = true; // Always show active products

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          productType: {
            select: {
              nameBg: true,
              nameEn: true,
            },
          },
          manufacturer: {
            select: {
              displayName: true,
              colorCode: true,
            },
          },
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productType: {
          select: {
            nameBg: true,
            nameEn: true,
          },
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        attributeValues: {
          include: {
            attributeType: {
              select: {
                nameBg: true,
                nameEn: true,
                type: true,
              },
            },
            attributeValue: {
              select: {
                nameBg: true,
                nameEn: true,
                colorCode: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return {
      success: true,
      data: product,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check for existing code if provided and different from current
    if (updateProductDto.code && updateProductDto.code !== product.code) {
      const existingProduct = await this.prisma.product.findFirst({
        where: {
          code: updateProductDto.code,
          id: { not: id },
        },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this code already exists');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        updatedById: userId,
      },
      include: {
        productType: {
          select: {
            nameBg: true,
            nameEn: true,
          },
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    };
  }

  async remove(id: string) {
    // Soft delete by setting isActive to false
    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    return {
      success: true,
      message: 'Product deactivated successfully',
      data: product
    };
  }

  async checkCode(code: string) {
    const existingProduct = await this.prisma.product.findFirst({
      where: { code },
      select: {
        nameBg: true,
      },
    });

    return {
      success: true,
      data: {
        exists: !!existingProduct,
        name: existingProduct?.nameBg || null,
      },
    };
  }

  async getStats() {
    const [total, recommended, active] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.count({ where: { isActive: true, isRecommended: true } }),
      this.prisma.product.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        recommended,
      },
    };
  }

  async addMediaFiles(productId: string, files: any[], mediaType: string) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Process uploaded files
    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    
    // Get current media data
    const currentMedia = {
      images: (product.images as string[]) || [],
      documents: (product.documents as string[]) || [],
      models3d: (product.models3d as string[]) || [],
      textures: (product.textures as string[]) || [],
    };

    // Add new files based on media type
    switch (mediaType) {
      case 'images':
        currentMedia.images = [...currentMedia.images, ...fileUrls];
        break;
      case 'documents':
        currentMedia.documents = [...currentMedia.documents, ...fileUrls];
        break;
      case 'models3d':
        currentMedia.models3d = [...currentMedia.models3d, ...fileUrls];
        break;
      case 'textures':
        currentMedia.textures = [...currentMedia.textures, ...fileUrls];
        break;
      default:
        throw new Error('Invalid media type');
    }

    // Update product with new media
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        images: currentMedia.images,
        documents: currentMedia.documents,
        models3d: currentMedia.models3d,
        textures: currentMedia.textures,
      },
      include: {
        productType: {
          select: { nameBg: true, nameEn: true }
        },
        manufacturer: {
          select: { displayName: true, colorCode: true }
        }
      }
    });

    return {
      success: true,
      message: `${files.length} ${mediaType} uploaded successfully`,
      data: updatedProduct
    };
  }

  async removeMediaFile(productId: string, mediaType: string, filename: string) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get current media data
    const currentMedia = {
      images: (product.images as string[]) || [],
      documents: (product.documents as string[]) || [],
      models3d: (product.models3d as string[]) || [],
      textures: (product.textures as string[]) || [],
    };

    // Remove file from appropriate array
    const fileUrl = `/uploads/${filename}`;
    
    switch (mediaType) {
      case 'images':
        currentMedia.images = currentMedia.images.filter(url => url !== fileUrl);
        break;
      case 'documents':
        currentMedia.documents = currentMedia.documents.filter(url => url !== fileUrl);
        break;
      case 'models3d':
        currentMedia.models3d = currentMedia.models3d.filter(url => url !== fileUrl);
        break;
      case 'textures':
        currentMedia.textures = currentMedia.textures.filter(url => url !== fileUrl);
        break;
      default:
        throw new Error('Invalid media type');
    }

    // Update product without the removed file
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        images: currentMedia.images,
        documents: currentMedia.documents,
        models3d: currentMedia.models3d,
        textures: currentMedia.textures,
      },
      include: {
        productType: {
          select: { nameBg: true, nameEn: true }
        },
        manufacturer: {
          select: { displayName: true, colorCode: true }
        }
      }
    });

    // Optional: Delete physical file from filesystem
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Failed to delete physical file:', error);
    }

    return {
      success: true,
      message: `File ${filename} removed successfully`,
      data: updatedProduct
    };
  }

  async updateVideoUrl(productId: string, videoUrl: string) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Update product with new video URL
    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        videoUrl: videoUrl || null,
      },
      include: {
        productType: {
          select: { nameBg: true, nameEn: true }
        },
        manufacturer: {
          select: { displayName: true, colorCode: true }
        }
      }
    });

    return {
      success: true,
      message: 'Video URL updated successfully',
      data: updatedProduct
    };
  }

  async toggleActive(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        isActive: !product.isActive,
        updatedAt: new Date(),
      },
      include: {
        productType: {
          select: {
            nameBg: true,
            nameEn: true,
          },
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true,
          },
        },
      },
    });

    return updatedProduct;
  }
} 