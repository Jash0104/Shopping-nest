import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}


  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //* limits: { } We are able to restrict limits
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductFile( 
    @UploadedFile() file: Express.Multer.File
  ) {
    if ( !file )
      throw new BadRequestException("Make sure file is an image")
  
    const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`

    return {
      secureUrl
    }
  }

  @Get('product/:fileName')
  findProductImage(
    @Res() res: Response,
    @Param('fileName') fileName
  ) {

      const path = this.filesService.getStaticProductImage( fileName )
  
      res.sendFile( path)
    
  }
}
