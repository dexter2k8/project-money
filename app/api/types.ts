export interface IResponse<T> {
  data: T[];
  count: number;
  csvData?: T[];
}

export type TPostBankArgs = {
  id: string;
  name: string;
  alias: string;
};

export type TGetBankResponse = TPostBankArgs;

export type TPatchBankArgs = TPostBankArgs;
