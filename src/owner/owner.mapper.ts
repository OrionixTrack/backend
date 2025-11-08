import { Company, CompanyOwner } from '../common/entities';
import { OwnerUserDto } from './dto/owner-user.dto';
import { CompanyMapper } from '../common/mappers/company.mapper';

export class OwnerMapper {
  static toUserDto(owner: CompanyOwner, company: Company): OwnerUserDto {
    return {
      id: owner.company_owner_id,
      email: owner.email,
      full_name: owner.full_name,
      language: owner.language,
      company: CompanyMapper.toDto(company),
    };
  }
}
