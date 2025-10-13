import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { QueryDto } from 'src/DTO/query.dto';
import { CreateAssistantDto } from 'src/DTO/create-assistant.dto';
import { assistants } from 'src/entities/assistants.entity';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

   /**
   * Endpoint pour interroger un assistant avec une question
   * @param body { question: string, assistantkey: string }
   */ 

  @Post('query')
  async query(@Body() body: QueryDto) {
    return this.ragService.query(body.question, body.assistantkey);
  }

  /**
   * Endpoint pour créer un assistant IA
   * @param dto Données nécessaires à la création de l’assistant
   */

  @Post('create-assistant')
  @HttpCode(HttpStatus.CREATED)
  async createAssistant(@Body() dto: CreateAssistantDto) {
    return this.ragService.createAssistant(dto);
  }


  
  /**
   * Endpoint pour récupérer tous les assistants d’un utilisateur
   * @param idUser identifiant utilisateur
   */
  

  @Get('user/:idUser/assistants')
  @HttpCode(HttpStatus.OK)
  async getByUser(
    @Param('idUser', ParseIntPipe) idUser: number,
  ): Promise<assistants[]> {
    return this.ragService.getAssistantsByUser(idUser);
  }

}
