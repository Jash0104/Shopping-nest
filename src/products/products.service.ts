import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities/';
import { DataSource, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User } from 'src/auth/entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}


  async create( createProductDto: CreateProductDto, user: User ) {
    try {

      const { images = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({ 
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image })),
        user
      })
      await this.productRepository.save( product )

      return {
        ...product,
        images
      }
    } catch (error) {
      this.handleDBExceptions( error )
    }
  }

  async findAll( paginationDto: PaginationDto ) {
    try {
      const { limit = 10, offset = 0 } = paginationDto

      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true
        }
      })

      return products.map( product => ({
        ...product,
        images: product.images.map( image => image.url)
      }))

    } catch (error) {
      this.handleDBExceptions( error )
    }
  }

  async findOne( term: string ) {
    
    let productSnap: Product;

    if ( isUUID(term) ) {
      productSnap = await this.productRepository.findOneBy({
        id: term
      })
    } else {
      const query = this.productRepository.createQueryBuilder('prod')
      productSnap = await query
      .where('UPPER(title) =:title or slug =:slug', {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne()

    }

    if ( !productSnap )
      throw new NotFoundException(`Product with id or slug ${term} not found`)

    return productSnap
    
  }

  async findOnePlain( term: string ) {
    const { images = [], ...productDetails } = await this.findOne( term )
    return {
      ...productDetails,
      images: images.map( img => img.url )
    }
  }

  async update( id: string, updateProductDto: UpdateProductDto, user: User ) {
    
    
    const { images, ...toUpdate } = updateProductDto
    
    const product = await this.productRepository.preload({ id, ...toUpdate })
    
    if ( !product ) 
      throw new NotFoundException(`Product with id ${id} not found`)
    
    // Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect() 
    await queryRunner.startTransaction()
    
    try {
      
      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } })
        
        product.images = images.map( 
          img => this.productImageRepository.create({ url: img })
        )
      } 

      product.user = user
      await queryRunner.manager.save( product )
      await queryRunner.commitTransaction()
      await queryRunner.release()

      return this.findOnePlain( id )

      } catch (error) {

        await queryRunner.rollbackTransaction()
        await queryRunner.release()

        this.handleDBExceptions( error )     
      }
  }

  async remove( id: string ) {

    const product = await this.findOne( id )
    await this.productRepository.remove( product )

    return { message: 'The product was deleted succesfully'}
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')

    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch ( error ) {
      this.handleDBExceptions( error )
    }
  }

  private handleDBExceptions( error: any ) {
    if ( error.code === '23505') 
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw error
    // throw new InternalServerErrorException('Unexpected error, please check server logs')
  }
}
