import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
        description: 'El título del producto. Este campo es obligatorio y debe tener al menos un carácter.',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({
        description: 'El precio del producto. Este campo es opcional, debe ser un número positivo si se proporciona.',
        nullable: true,
        example: 29.99
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({
        description: 'Una descripción del producto. Este campo es opcional.',
        nullable: true,
        example: 'Un producto de alta calidad.'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'El slug del producto, utilizado para la URL. Este campo es opcional.',
        nullable: true,
        example: 'producto-ejemplo'
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'La cantidad de stock disponible para el producto. Este campo es opcional y debe ser un número entero positivo si se proporciona.',
        nullable: true,
        example: 100
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Tamaños disponibles para el producto. Este campo es obligatorio y debe ser un array de cadenas.',
        nullable: false,
        type: [String],
        example: ["XS", "S", "M"]
    })
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({
        description: 'Etiquetas asociadas al producto. Este campo es opcional y debe ser un array de cadenas.',
        nullable: true,
        type: [String]
    })
    @IsString({ each: true })
    @IsOptional()
    @IsArray()
    tags?: string[];

    @ApiProperty({
        description: 'Género al que está dirigido el producto. Este campo es obligatorio y debe ser uno de los siguientes valores: "men", "woman", "kid".',
        nullable: false,
        enum: ['men', 'woman', 'kid']
    })
    @IsIn(['men', 'woman', 'kid'])
    gender: string;

    @ApiProperty({
        description: 'Imágenes del producto. Este campo es opcional y debe ser un array de cadenas.',
        nullable: true,
        type: [String]
    })
    @IsString({ each: true })
    @IsOptional()
    @IsArray()
    images?: string[];
}
