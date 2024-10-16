import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiForbiddenResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities';
import { ValidRoles } from 'src/auth/interfaces';
import { Product } from './entities';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth( ValidRoles.admin )
  @ApiResponse({ status: 201, description: 'Product was created succesfully', type: Product})
  @ApiResponse({ status: 400, description: 'Bad Request'})
  @ApiUnauthorizedResponse({ description: 'Token provided was not valid.' })
  @ApiForbiddenResponse({ description: 'User do not have needed permissions.' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return await this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiResponse({ status: 201, description: 'List of Products', type: [Product] })
  findAll( @Query() paginationDto: PaginationDto) {
    return this.productsService.findAll( paginationDto );
  }

  @Get(':term')
  @ApiResponse({ status: 201, description: 'Product found in the database', type: Product })
  @ApiResponse({ status: 404, description: 'Product not found'})
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain( term );
  }

  @Patch(':id')
  @Auth( ValidRoles.admin )
  @ApiBearerAuth() // Indica que se necesita un token Bearer
  @ApiResponse({ status: 200, description: 'Product updated succesfully', type: Product })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiUnauthorizedResponse({ description: 'Token provided was not valid.' })
  @ApiForbiddenResponse({ description: 'User do not have needed permissions.' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
