import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities';

@Injectable()
export class SeedService {
  
constructor(
  private readonly productService: ProductsService,
  @InjectRepository( User )
  private readonly userRepository: Repository<User>
) {}

  async runSeed() {
    await this.deleteTables()

    const adminUser = await this.insertUsers()
    await this.insertNewProducts( adminUser )
    
    return {
      message: 'Seed Executed'
    }
  }

  private async deleteTables() {

    await this.productService.deleteAllProducts()
    
    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }
  
  private async insertNewProducts( user: User ) {
    await this.productService.deleteAllProducts()
    const seedProducts = initialData.products;

    const insertPromises = []

    seedProducts.forEach( product => {
      insertPromises.push( this.productService.create( product, user ) )
    })

    await Promise.all( insertPromises )
  }

  private async insertUsers() {
    const seedUsers = initialData.users

    const users: User[] = []

    seedUsers.forEach( user => {
      user.password = bcrypt.hashSync(user.password, 10)
      users.push( this.userRepository.create( user ))
    })

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0]
  }
 
}
