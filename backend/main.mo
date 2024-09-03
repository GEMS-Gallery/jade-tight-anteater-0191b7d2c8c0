import Array "mo:base/Array";
import Func "mo:base/Func";
import Hash "mo:base/Hash";

import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Iter "mo:base/Iter";

actor {
  // Define the TaxPayer type
  type TaxPayer = {
    tid: Nat;
    firstName: Text;
    lastName: Text;
    address: Text;
  };

  // Create a stable variable to store TaxPayer records
  stable var taxPayerEntries : [(Nat, TaxPayer)] = [];

  // Create a HashMap to store TaxPayer records
  var taxPayers = HashMap.HashMap<Nat, TaxPayer>(0, Nat.equal, Nat.hash);

  // Initialize the HashMap with stable data
  taxPayers := HashMap.fromIter<Nat, TaxPayer>(taxPayerEntries.vals(), 0, Nat.equal, Nat.hash);

  // Mutable variable to keep track of the next available TID
  var nextTID : Nat = 1;

  // Function to create a new TaxPayer record
  public func createTaxPayer(firstName : Text, lastName : Text, address : Text) : async Result.Result<Nat, Text> {
    let tid = nextTID;
    let taxPayer : TaxPayer = {
      tid = tid;
      firstName = firstName;
      lastName = lastName;
      address = address;
    };
    taxPayers.put(tid, taxPayer);
    nextTID += 1;
    #ok(tid)
  };

  // Function to get all TaxPayer records
  public query func getAllTaxPayers() : async [TaxPayer] {
    Iter.toArray(taxPayers.vals())
  };

  // Function to search for a TaxPayer by TID
  public query func searchTaxPayerByTID(tid : Nat) : async ?TaxPayer {
    taxPayers.get(tid)
  };

  // Pre-upgrade hook to store the HashMap data
  system func preupgrade() {
    taxPayerEntries := Iter.toArray(taxPayers.entries());
  };

  // Post-upgrade hook to restore the HashMap data
  system func postupgrade() {
    taxPayers := HashMap.fromIter<Nat, TaxPayer>(taxPayerEntries.vals(), 0, Nat.equal, Nat.hash);
    nextTID := taxPayerEntries.size() + 1;
  };
}
