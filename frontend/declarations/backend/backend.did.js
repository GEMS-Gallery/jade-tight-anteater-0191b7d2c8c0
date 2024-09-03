export const idlFactory = ({ IDL }) => {
  const Result = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const TaxPayer = IDL.Record({
    'tid' : IDL.Nat,
    'address' : IDL.Text,
    'lastName' : IDL.Text,
    'firstName' : IDL.Text,
  });
  return IDL.Service({
    'createTaxPayer' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'getAllTaxPayers' : IDL.Func([], [IDL.Vec(TaxPayer)], ['query']),
    'searchTaxPayerByTID' : IDL.Func([IDL.Nat], [IDL.Vec(TaxPayer)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
