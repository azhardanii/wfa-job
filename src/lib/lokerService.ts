/**
 * lokerService - Service layer delegating to LokerORM
 * Manages Admin Session & PIN authentication
 */

import { WfaLoker } from "@/types/loker";
import { LokerORM, CreateLokerDTO, UpdateLokerDTO, verifyAdminPin } from "./orm/LokerORM";

const ADMIN_SESSION_KEY = "wfa_admin_auth_session_v1";

export function getStoredAdminPin(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ADMIN_SESSION_KEY);
      if (stored) return stored;
    } catch {
      // ignore
    }
  }
  return process.env.NEXT_PUBLIC_ADMIN_PIN || "wfa2026admin";
}

export function saveAdminSessionPin(pin: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_SESSION_KEY, pin);
  }
}

export function clearAdminSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAuthenticatedAdmin(pin?: string): boolean {
  const testPin = pin || getStoredAdminPin();
  return verifyAdminPin(testPin);
}

export const lokerService = {
  // Read all records via ORM
  async getAll(): Promise<{ lokers: WfaLoker[]; source: "firestore" | "local" }> {
    const res = await LokerORM.findMany();
    return {
      lokers: res.data,
      source: res.source,
    };
  },

  // Read single record
  async getById(id: string): Promise<WfaLoker | null> {
    return LokerORM.findById(id);
  },

  // Create record with ORM validation & security check
  async create(
    data: CreateLokerDTO,
    pin?: string
  ): Promise<{ success: boolean; loker?: WfaLoker; error?: string }> {
    const adminPin = pin || getStoredAdminPin();
    const result = await LokerORM.create(data, adminPin);
    return {
      success: result.success,
      loker: result.data,
      error: result.error,
    };
  },

  // Update record with ORM validation & security check
  async update(
    id: string,
    updates: UpdateLokerDTO,
    pin?: string
  ): Promise<{ success: boolean; loker?: WfaLoker; error?: string }> {
    const adminPin = pin || getStoredAdminPin();
    const result = await LokerORM.update(id, updates, adminPin);
    return {
      success: result.success,
      loker: result.data,
      error: result.error,
    };
  },

  // Delete record
  async delete(id: string, pin?: string): Promise<{ success: boolean; error?: string }> {
    const adminPin = pin || getStoredAdminPin();
    return LokerORM.delete(id, adminPin);
  },

  // Toggle status
  async toggleStatus(id: string, pin?: string): Promise<{ success: boolean; loker?: WfaLoker; error?: string }> {
    const adminPin = pin || getStoredAdminPin();
    const res = await LokerORM.toggleStatus(id, adminPin);
    return {
      success: res.success,
      loker: res.data,
      error: res.error,
    };
  },

  // Seed sample data
  async seedToCloud(pin?: string): Promise<{ success: boolean; message: string }> {
    const adminPin = pin || getStoredAdminPin();
    const res = await LokerORM.seedSampleData(adminPin);
    return {
      success: res.success,
      message: res.message,
    };
  },
};
