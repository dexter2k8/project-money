export type TPostAccountResponse = {
  acctid: string;
  accttype: string;
  bankid: number;
  branchid: string;
  description: string;
  id: string;
};

export type TGetAccountResponse = TPostAccountResponse;
