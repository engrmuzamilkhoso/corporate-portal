export interface Operator {
  value: string,
  label: string,
}

export interface ConfigData {
  id: string | null;
  templateName: string;
  account_route: string;
  region: string;
  channel: string;
  operator: string;
  operatorMerchantId: string[];
  fileLimit: number;
  cutOffTime: string;
  filename: string;
  extension: string;
  type: string;
  dbType: string;
  thresholdTime: number;
  headers: string[];
  emails: string[];
  headerMappings: {
    simpaisaHeader: string;
    mappedHeader: string;
  }[];
  makerId: string;
  checkerId: string | null;
  applyConfiguration: boolean,
  deactivateConfiguration: boolean,
  makerCheckerStatus: string | null,
  makerCheckerId: string | null,
  comments: string,
  isCorporate: boolean,
  operatorConfigurationStatus: string,
}

export type ConfigurationDropdownOption = {
  value: string
  label: string
}

export type ProductCategory = 'Payin' | 'Payout';

export const configChannels: ConfigurationDropdownOption[] = [
  { value: 'Collection', label: 'Collection' },
  { value: 'Disbursement', label: 'Disbursement' },
  { value: 'Remittance', label: 'Remittance' },
]

export const configAccountRoutes: ConfigurationDropdownOption[] = [
  { value: 'MG', label: 'MG' },
  { value: 'SP', label: 'SP' },
]

export const configRegions: ConfigurationDropdownOption[] = [
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Bangladesh', label: 'Bangladesh' },
]

export const configFileExtensions: ConfigurationDropdownOption[] = [
  { value: 'csv', label: 'csv' },
  { value: 'xlsx', label: 'xlsx' },
]

export const configReconciliationTypes: ConfigurationDropdownOption[] = [ // this is product (admin portal)
  { value: 'Payin', label: 'Payin' },
  { value: 'Payout', label: 'Payout' },
]

export const configProductTypes: Record<ProductCategory, ConfigurationDropdownOption[]> = { // dbType in document
  'Payin': [
    { value: 'Wallet', label: 'Wallet' },
    { value: 'DCB', label: 'DCB' },
    { value: 'Card', label: 'Card' },
  ],
  'Payout': [
    { value: 'Disbursement', label: 'Disbursement' },
    { value: 'Remittance', label: 'Remittance' },
  ]
}

import { formatDataList } from '@/utils/formatDataList'

export const operatorMapping = (
  response: any,
  setterFunction: (options: ConfigurationDropdownOption[]) => void,
  configData?: ConfigData,
) => {
  const data = response?.data
  const items = Array.isArray(data) ? data : data?.content || []
  const formatted = formatDataList(items)
  const options: ConfigurationDropdownOption[] = [
    ...formatted.map((it) => ({ value: String(it.id), label: it.label, selected: configData?.operatorMerchantId.includes(it.id.toString()) ?? false })),
  ]
  setterFunction(options)
}

