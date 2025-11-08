import { Dispatcher } from '../common/entities';
import { DispatcherUserDto } from './dto/dispatcher-user.dto';
import { CompanyMapper } from '../common/mappers/company.mapper';

export class DispatcherMapper {
  static toUserDto(dispatcher: Dispatcher): DispatcherUserDto {
    return {
      id: dispatcher.dispatcher_id,
      email: dispatcher.email,
      name: dispatcher.name,
      surname: dispatcher.surname,
      language: dispatcher.language,
      company: CompanyMapper.toDto(dispatcher.company),
    };
  }
}
