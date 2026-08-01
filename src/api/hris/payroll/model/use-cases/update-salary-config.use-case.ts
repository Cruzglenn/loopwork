import { type UpdateSalaryConfigDto, type EmployeeSalaryConfigDto } from '../dtos';
import { type PayrollRepository } from '../repositories';

export function updateSalaryConfigUseCase(payrollRepository: PayrollRepository) {
  return async (dto: UpdateSalaryConfigDto): Promise<EmployeeSalaryConfigDto> => {
    return payrollRepository.upsertSalaryConfig(dto);
  };
}
