export const TransactionStatusMap: Record<
  string,
  { label: string; className: string }
> = {
  "0": { label: "Pending", className: "reviewStatus" },
  "1": { label: "Success", className: "successStatus" },
  "2": { label: "Failed", className: "failedStatus" },
  "11": { label: "Cancelled", className: "failedStatus" },
}

export const getTransactionStatusClass = (code: string | number): { label: string; className: string } => 
    TransactionStatusMap[code] ?? null