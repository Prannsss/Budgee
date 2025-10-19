// Debug helper - can be removed after testing
import API from "@/lib/api-service";

export function testSpendingLimitsAPI() {
  console.log("API object:", API);
  console.log("spendingLimits:", API.spendingLimits);
  console.log("getSpendingLimitStatus:", API.spendingLimits?.getSpendingLimitStatus);
}

// Call this in your component to debug
// testSpendingLimitsAPI();
