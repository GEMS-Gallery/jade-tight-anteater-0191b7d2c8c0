export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const CapitalGain = IDL.Record({ 'date' : Time, 'amount' : IDL.Float64 });
  const TaxPayer = IDL.Record({
    'tid' : IDL.Nat,
    'address' : IDL.Text,
    'lastName' : IDL.Text,
    'capitalGains' : IDL.Vec(CapitalGain),
    'firstName' : IDL.Text,
  });
  return IDL.Service({
    'addCapitalGain' : IDL.Func([IDL.Nat, Time, IDL.Float64], [Result], []),
    'createTaxPayer' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'deleteTaxPayer' : IDL.Func([IDL.Nat], [Result], []),
    'getAllTaxPayers' : IDL.Func([], [IDL.Vec(TaxPayer)], ['query']),
    'searchTaxPayerByTID' : IDL.Func([IDL.Nat], [IDL.Vec(TaxPayer)], ['query']),
    'updateTaxPayer' : IDL.Func(
        [IDL.Nat, IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
