import { BodypartOption } from 'src/modules/budsies';

export default interface SizeOption extends BodypartOption {
  optionId: number,
  optionValueId: string,
  finalPrice: number,
  regularPrice: number,
  specialPrice: number,
  disabledUpgrades: string[]
}
