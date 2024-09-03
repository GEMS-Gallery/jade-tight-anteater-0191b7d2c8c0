import Hash "mo:base/Hash";

import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Float "mo:base/Float";

actor {
  type CapitalGain = {
    date: Time.Time;
    amount: Float;
  };

  type TaxPayer = {
    tid: Nat;
    firstName: Text;
    lastName: Text;
    address: Text;
    capitalGains: [CapitalGain];
  };

  stable var taxPayerEntries : [(Nat, TaxPayer)] = [];

  var taxPayers = HashMap.HashMap<Nat, TaxPayer>(0, Nat.equal, Nat.hash);

  taxPayers := HashMap.fromIter<Nat, TaxPayer>(taxPayerEntries.vals(), 0, Nat.equal, Nat.hash);

  var nextTID : Nat = 1;

  public func createTaxPayer(firstName : Text, lastName : Text, address : Text) : async Result.Result<Nat, Text> {
    let tid = nextTID;
    let taxPayer : TaxPayer = {
      tid = tid;
      firstName = firstName;
      lastName = lastName;
      address = address;
      capitalGains = [];
    };
    taxPayers.put(tid, taxPayer);
    nextTID += 1;
    #ok(tid)
  };

  public query func getAllTaxPayers() : async [TaxPayer] {
    Iter.toArray(taxPayers.vals())
  };

  public query func searchTaxPayerByTID(tid : Nat) : async [TaxPayer] {
    switch (taxPayers.get(tid)) {
      case (null) { [] };
      case (?taxPayer) { [taxPayer] };
    }
  };

  public func updateTaxPayer(tid : Nat, firstName : Text, lastName : Text, address : Text) : async Result.Result<(), Text> {
    switch (taxPayers.get(tid)) {
      case (null) { #err("TaxPayer not found") };
      case (?existingTaxPayer) {
        let updatedTaxPayer : TaxPayer = {
          tid = existingTaxPayer.tid;
          firstName = firstName;
          lastName = lastName;
          address = address;
          capitalGains = existingTaxPayer.capitalGains;
        };
        taxPayers.put(tid, updatedTaxPayer);
        #ok()
      };
    }
  };

  public func deleteTaxPayer(tid : Nat) : async Result.Result<(), Text> {
    switch (taxPayers.remove(tid)) {
      case (null) { #err("TaxPayer not found") };
      case (?_) { #ok() };
    }
  };

  public func addCapitalGain(tid : Nat, date : Time.Time, amount : Float) : async Result.Result<(), Text> {
    switch (taxPayers.get(tid)) {
      case (null) { #err("TaxPayer not found") };
      case (?existingTaxPayer) {
        let newCapitalGain : CapitalGain = {
          date = date;
          amount = amount;
        };
        let updatedTaxPayer : TaxPayer = {
          tid = existingTaxPayer.tid;
          firstName = existingTaxPayer.firstName;
          lastName = existingTaxPayer.lastName;
          address = existingTaxPayer.address;
          capitalGains = Array.append(existingTaxPayer.capitalGains, [newCapitalGain]);
        };
        taxPayers.put(tid, updatedTaxPayer);
        #ok()
      };
    }
  };

  system func preupgrade() {
    taxPayerEntries := Iter.toArray(taxPayers.entries());
  };

  system func postupgrade() {
    taxPayers := HashMap.fromIter<Nat, TaxPayer>(taxPayerEntries.vals(), 0, Nat.equal, Nat.hash);
    nextTID := taxPayerEntries.size() + 1;
  };
}
