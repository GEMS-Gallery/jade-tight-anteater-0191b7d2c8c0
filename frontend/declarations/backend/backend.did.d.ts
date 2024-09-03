import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type Result = { 'ok' : bigint } |
  { 'err' : string };
export interface TaxPayer {
  'tid' : bigint,
  'address' : string,
  'lastName' : string,
  'firstName' : string,
}
export interface _SERVICE {
  'createTaxPayer' : ActorMethod<[string, string, string], Result>,
  'getAllTaxPayers' : ActorMethod<[], Array<TaxPayer>>,
  'searchTaxPayerByTID' : ActorMethod<[bigint], Array<TaxPayer>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
