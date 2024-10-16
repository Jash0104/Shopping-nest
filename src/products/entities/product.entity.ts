import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities";
import { ApiProperty } from "@nestjs/swagger";
@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'a6457116-25f7-48c8-8288-152ae3ff0a42',
        description: 'ID único del producto',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: "Jash's shirt6",
        description: 'Título del producto, debe ser único.',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({
        example: 100000,
        description: 'Precio del producto en la moneda local.'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: null,
        description: 'Descripción del producto. Puede ser nula.'
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: "jashs_shirt6",
        description: 'Slug del producto, utilizado para la URL. Debe ser único.',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 0,
        description: 'Cantidad de stock disponible del producto.'
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ["XS", "S", "M", "L"],
        description: 'Tamaños disponibles para el producto.'
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: "men",
        description: 'Género al que está dirigido el producto (ej. "men", "women").'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: [],
        description: 'Etiquetas asociadas al producto para facilitar la búsqueda.'
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty({
        type: () => ProductImage,
        isArray: true,
        description: 'Imágenes asociadas al producto.'
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ApiProperty({
        type: () => User,
        description: 'Usuario que creó el producto.'
    })
    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }

    @BeforeUpdate()
    checkSlugFormat() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
