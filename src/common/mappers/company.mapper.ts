import { Company } from '../entities';
import { CompanyDto } from '../dto/company.dto';

export class CompanyMapper {
  static toDto(company: Company): CompanyDto {
    return {
      id: company.company_id,
      name: company.name,
    };
  }
}
