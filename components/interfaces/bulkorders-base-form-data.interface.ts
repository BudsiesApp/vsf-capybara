import { CustomerImage } from 'src/modules/shared';

export default interface BulkordersBaseFormData {
  name: string,
  description: string,
  quantity?: number,
  additionalQuantity?: number,
  deadline?: '0' | '1',
  deadlineDate?: string,
  country: string,
  customerFirstName: string,
  customerLastName?: string,
  customerEmail: string,
  customerPhone: string,
  customerImages: CustomerImage[],
  customerType?: string,
  agreement: boolean
}
