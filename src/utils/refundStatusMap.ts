export const RefundStatusMap: Record<
  string,
  { label: string; className: string }
> = {
  "0": { label: "Pending", className: "reviewStatus" },
  "1": { label: "Success", className: "successStatus" },
  "2": { label: "Failed", className: "failedStatus" },
  "3": { label: "Refund Pending (Success)", className: "successStatus" },
  "4": { label: "Refund Pending (Failed)", className: "failedStatus" },
  "5": { label: "Refunded", className: "successStatus" },
  "6": { label: "Refund Failed", className: "failedStatus" },
  "7": { label: "First Time Partial Refund Success", className: "otherStatus" },
  "8": { label: "Success Offline Dispute", className: "successStatus" },
  "9": { label: "Failed Offline Dispute", className: "failedStatus" },
}

export const getRefundStatus = (code: string | number): { label: string; className: string } => 
    RefundStatusMap[code] ?? null