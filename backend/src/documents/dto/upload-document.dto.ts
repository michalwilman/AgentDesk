import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class UploadDocumentDto {
  @IsUUID()
  @IsNotEmpty()
  botId: string;
}

