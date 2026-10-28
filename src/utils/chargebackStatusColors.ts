export const ChargebackStatusColors: Record<string, "otherStatus" | "cancelledStatus" | "successStatus" | "failedStatus" | "reviewStatus" | "pendingStatus"> = {
  "Initiated": "otherStatus",
  "In Process": "reviewStatus",
  "Cancelled": "cancelledStatus",
  "Rejected": "failedStatus",
  "Failed": "failedStatus",
  "Approved": "successStatus",
  "Decline": "failedStatus",
  "Completed": "successStatus",
  "Offline Refund": "otherStatus",
}
