export default interface BulkordersBaseFormData {
  name: string,
  description: string,
  quantity: number,
  additionalQuantity: number,
  deadline?: Date,
  country: string,
  customerFirstName: string,
  customerLastName?: string,
  customerEmail: string,
  customerPhone: string
}
