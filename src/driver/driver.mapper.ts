import { Driver } from '../common/entities';
import { DriverUserDto } from './dto/driver-user.dto';
import { CompanyMapper } from '../common/mappers/company.mapper';

export class DriverMapper {
  static toUserDto(driver: Driver): DriverUserDto {
    return {
      id: driver.driver_id,
      email: driver.email,
      name: driver.name,
      surname: driver.surname,
      language: driver.language,
      company: CompanyMapper.toDto(driver.company),
    };
  }
}
