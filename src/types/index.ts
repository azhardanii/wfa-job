export type Role = "WORKER" | "BOSS";
export type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
export type WorkerTier = "STARTER" | "SENIOR" | "EXPERT";
export type JobMode = "OFFER" | "SPOT";
export type JobStatus = "OPEN" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "CANCELLED" | "DISPUTED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type EscrowStatus = "LOCKED" | "PARTIALLY_RELEASED" | "RELEASED" | "REFUNDED";
export type MilestoneStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "RELEASED";
export type TxType = "TOPUP" | "LOCK" | "RELEASE" | "WITHDRAW" | "FEE" | "REFUND";
export type TxStatus = "PENDING" | "SUCCESS" | "FAILED";
export type DisputeStatus = "OPEN" | "FAST_TRACK_RESOLVED" | "MANUAL_REVIEW" | "RESOLVED";

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatarUrl?: string;
  activeRole: Role;
  isPhoneVerified: boolean;
  kycStatus: KycStatus;
  tier: WorkerTier;
  gmvRealized: number; // in USD ($)
  bio?: string;
  skills?: string[];
  portfolio?: { id: string; title: string; image: string; link?: string }[];
  ratingAverage: number;
  completedJobsCount: number;
  createdAt: string;
}

export interface Milestone {
  id: string;
  jobId: string;
  title: string;
  amount: number; // in USD ($)
  status: MilestoneStatus;
  deliverable?: string;
}

export interface Escrow {
  id: string;
  jobId: string;
  amountUSD: number; // in USD ($)
  status: EscrowStatus;
  autoReleaseAt?: string; // ISO date
  lockedAt: string;
  releasedAt?: string;
}

export interface Offer {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerAvatar?: string;
  workerTier: WorkerTier;
  workerRating: number;
  message: string;
  price: number; // in USD ($)
  deliveryDays: number;
  status: OfferStatus;
  createdAt: string;
}

export interface SpotClaim {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  claimedAt: string;
  expiresAt: string; // 15 mins
  submissionText?: string;
  submissionProofUrl?: string;
  status: "CLAIMED" | "SUBMITTED" | "APPROVED" | "EXPIRED" | "REJECTED";
}

export interface Job {
  id: string;
  bossId: string;
  bossName: string;
  bossAvatar?: string;
  bossRating: number;
  bossJobsCompleted: number;
  title: string;
  description: string;
  category: "Design & Creative" | "Dev & IT" | "Virtual Assisting" | "Video & Animation" | "Writing & Copy" | "Gaming & Microtask" | "Other";
  mode: JobMode;
  budget: number; // in USD ($)
  deadline: string; // ISO date
  status: JobStatus;
  spotLimit?: number;
  spotsClaimedCount?: number;
  offersCount?: number;
  selectedWorkerId?: string;
  selectedWorkerName?: string;
  selectedOfferPrice?: number;
  createdAt: string;
  escrow?: Escrow;
  milestones?: Milestone[];
  spots?: SpotClaim[];
  dispute?: Dispute;
  digitalContract?: DigitalContract;
}

export interface DigitalContract {
  contractNumber: string;
  scope: string;
  escrowRule: string;
  autoReleaseHours: number;
  platformFeePercent: number;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TxType;
  amount: number; // in USD ($)
  status: TxStatus;
  refId?: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceUSD: number; // in USD ($)
  lockedInEscrowUSD: number; // in USD ($)
  transactions: Transaction[];
}

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  raisedById: string;
  raisedByName: string;
  reason: string;
  evidenceUrl?: string;
  evidenceText: string;
  resolution?: string;
  status: DisputeStatus;
  createdAt: string;
}

export interface Rating {
  id: string;
  jobId: string;
  jobTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  score: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  fileUrl?: string;
  createdAt: string;
}

export type Theme = "light" | "dark";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "OFFER" | "ESCROW" | "JOB" | "DISPUTE" | "WALLET" | "SYSTEM";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

