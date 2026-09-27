export type JobWorkMode = "Full Time" | "Part Time";
export type JobLocationType = "Remote" | "On-site";
export type JobPostingStatus = "ACTIVE" | "CLOSED";

export interface WfaLoker {
  id: string;
  title: string;
  companyName: string;
  thumbnailUrl: string;
  description: string;
  salaryEstimate: string; // contoh: "Rp 6.000.000 - Rp 10.000.000 / bln" atau "$800 - $1,500 / month"
  mode: JobWorkMode; // "Full Time" | "Part Time"
  locationType: JobLocationType; // "Remote" | "On-site"
  offlineAddress?: string; // wajib/muncul jika locationType === "On-site"
  applyUrl: string; // link lamaran eksternal
  category?: string;
  status: JobPostingStatus; // "ACTIVE" | "CLOSED"
  featured?: boolean;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface LokerFilterOptions {
  searchQuery: string;
  locationType: "ALL" | JobLocationType;
  mode: "ALL" | JobWorkMode;
  category: string;
  status: "ALL" | JobPostingStatus;
}
