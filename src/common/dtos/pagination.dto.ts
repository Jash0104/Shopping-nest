import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'Hoy many results do you need'
    })
    @IsOptional()
    @IsPositive()
    // Transformar
    @Type( () => Number )
    limit?: number

    @ApiProperty({
        default: 0,
        description: 'Hoy many results do you want to skip'
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type( () => Number )
    offset?: number
}