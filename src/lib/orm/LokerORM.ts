/**
 * LokerORM - Enterprise Typed ORM / Repository for WFA Job Postings
 * Implements:
 * 1. Strict Schema Validation & Sanitization (Anti-XSS & Injection Protection)
 * 2. Admin Security Verification (PIN Guarded CRUD)
 * 3. Firestore SDK with resilient Cloud REST fallback
 * 4. Local Cache Synchronization
 */

import { WfaLoker, JobWorkMode, JobLocationType, JobPostingStatus, LokerFilterOptions } from "@/types/loker";
import { initialWfaLokers } from "@/lib/mockLoker";
import { firebaseConfig, isFirebaseConfigured, getFirestoreDb } from "@/lib/firebase";

export interface CreateLokerDTO {
  title: string;
  companyName: string;
  thumbnailUrl?: string;
  description: string;
  salaryEstimate: string;
  mode: JobWorkMode;
  locationType: JobLocationType;
  offlineAddress?: string;
  applyUrl: string;
  category?: string;
  featured?: boolean;
}

export interface UpdateLokerDTO extends Partial<CreateLokerDTO> {
  status?: JobPostingStatus;
}

const LOCAL_STORAGE_KEY = "wfa_job_lokers_storage_v1";

// Security Sanitization Helper
function sanitizeString(str: string): string {
  if (!str) return "";
  // Strip out HTML tags to prevent XSS payloads
  return str.replace(/<[^>]*>?/gm, "").trim();
}

function sanitizeUrl(url: string): string {
  if (!url) return "#";
  const trimmed = url.trim();
  // Strictly enforce http or https URLs, block javascript:, data:, vbscript:
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

// Schema Validator
function validateLokerDTO(dto: Partial<CreateLokerDTO>, isCreate = true): string[] {
  const errors: string[] = [];

  if (isCreate || dto.title !== undefined) {
    if (!dto.title || dto.title.trim().length < 3) {
      errors.push("Judul lowongan kerja wajib diisi (minimal 3 karakter).");
    } else if (dto.title.length > 150) {
      errors.push("Judul lowongan maksimal 150 karakter.");
    }
  }

  if (isCreate || dto.companyName !== undefined) {
    if (!dto.companyName || dto.companyName.trim().length < 2) {
      errors.push("Nama perusahaan wajib diisi (minimal 2 karakter).");
    }
  }

  if (isCreate || dto.salaryEstimate !== undefined) {
    if (!dto.salaryEstimate || dto.salaryEstimate.trim().length < 2) {
      errors.push("Estimasi pendapatan wajib diisi (contoh: Rp 8.000.000 - Rp 12.000.000).");
    }
  }

  if (isCreate || dto.description !== undefined) {
    if (!dto.description || dto.description.trim().length < 10) {
      errors.push("Deskripsi pekerjaan wajib diisi (minimal 10 karakter).");
    }
  }

  if (dto.locationType === "On-site") {
    if (!dto.offlineAddress || dto.offlineAddress.trim().length < 5) {
      errors.push("Karena memilih lokasi 'On-site', Alamat Lokasi Kerja Offline wajib diisi!");
    }
  }

  return errors;
}

// Admin Security PIN Verification
export function verifyAdminPin(pin?: string): boolean {
  const requiredPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "wfa2026admin";
  if (!pin) return false;
  return pin.trim() === requiredPin.trim();
}

// Firestore REST Field Serializer / Deserializer
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = { doubleValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((v) => ({ stringValue: String(v) })),
        },
      };
    }
  }
  return fields;
}

function fromFirestoreDocument(doc: any): WfaLoker {
  const fields = doc.fields || {};
  const result: Record<string, any> = {};

  const pathParts = (doc.name || "").split("/");
  result.id = pathParts[pathParts.length - 1] || `loker-${Date.now()}`;

  for (const [key, valObj] of Object.entries(fields) as [string, any][]) {
    if ("stringValue" in valObj) result[key] = valObj.stringValue;
    else if ("doubleValue" in valObj) result[key] = Number(valObj.doubleValue);
    else if ("integerValue" in valObj) result[key] = Number(valObj.integerValue);
    else if ("booleanValue" in valObj) result[key] = valObj.booleanValue;
    else if ("arrayValue" in valObj) {
      result[key] = (valObj.arrayValue?.values || []).map((v: any) => v.stringValue || Object.values(v)[0]);
    }
  }

  return {
    id: result.id,
    title: sanitizeString(result.title || "Untitled Job"),
    companyName: sanitizeString(result.companyName || "Perusahaan WFA"),
    thumbnailUrl: sanitizeUrl(result.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"),
    description: result.description || "",
    salaryEstimate: sanitizeString(result.salaryEstimate || "Kompetitif"),
    mode: (result.mode as JobWorkMode) || "Full Time",
    locationType: (result.locationType as JobLocationType) || "Remote",
    offlineAddress: result.offlineAddress ? sanitizeString(result.offlineAddress) : undefined,
    applyUrl: sanitizeUrl(result.applyUrl || "#"),
    category: result.category || "General",
    status: (result.status as JobPostingStatus) || "ACTIVE",
    featured: Boolean(result.featured),
    createdAt: result.createdAt || new Date().toISOString(),
    updatedAt: result.updatedAt || undefined,
  };
}

// Local Storage Repository
function getLocalCache(): WfaLoker[] {
  if (typeof window === "undefined") return initialWfaLokers;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialWfaLokers));
      return initialWfaLokers;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialWfaLokers;
  } catch {
    return initialWfaLokers;
  }
}

function setLocalCache(items: WfaLoker[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * LokerORM Class
 */
export class LokerORM {
  /**
   * Get cached lokers synchronously without any network delay
   */
  static getCachedLokers(): WfaLoker[] {
    const list = getLocalCache();
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  /**
   * Find all loker records matching optional criteria (with fast 2.5s network timeout)
   */
  static async findMany(filters?: Partial<LokerFilterOptions>): Promise<{ data: WfaLoker[]; source: "firestore" | "local" }> {
    if (isFirebaseConfigured()) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lokers?key=${firebaseConfig.apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(url, { method: "GET", signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const docs = json.documents || [];
          if (docs.length > 0) {
            const list: WfaLoker[] = docs.map(fromFirestoreDocument);
            // Apply sorting (latest first)
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLocalCache(list);
            return { data: list, source: "firestore" };
          }
        }
      } catch (err) {
        // Fallback immediately on timeout or offline
      }
    }

    const localList = getLocalCache();
    localList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { data: localList, source: "local" };
  }

  /**
   * Find a single loker by ID
   */
  static async findById(id: string): Promise<WfaLoker | null> {
    const { data } = await this.findMany();
    return data.find((l) => l.id === id) || null;
  }

  /**
   * Create a new loker record (Protected by Admin PIN)
   */
  static async create(
    dto: CreateLokerDTO,
    adminPin: string
  ): Promise<{ success: boolean; data?: WfaLoker; error?: string }> {
    // 1. Security Check: verify Admin PIN
    if (!verifyAdminPin(adminPin)) {
      return { success: false, error: "Akses ditolak: PIN Keamanan Admin tidak valid!" };
    }

    // 2. Schema Validation
    const validationErrors = validateLokerDTO(dto, true);
    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(" ") };
    }

    // 3. Sanitization
    const newId = `loker-${Date.now()}`;
    const sanitizedLoker: WfaLoker = {
      id: newId,
      title: sanitizeString(dto.title),
      companyName: sanitizeString(dto.companyName),
      thumbnailUrl: sanitizeUrl(dto.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"),
      description: dto.description.trim(),
      salaryEstimate: sanitizeString(dto.salaryEstimate),
      mode: dto.mode,
      locationType: dto.locationType,
      offlineAddress: dto.locationType === "On-site" && dto.offlineAddress ? sanitizeString(dto.offlineAddress) : undefined,
      applyUrl: sanitizeUrl(dto.applyUrl),
      category: dto.category || "General",
      status: "ACTIVE",
      featured: Boolean(dto.featured),
      createdAt: new Date().toISOString(),
    };

    // 4. Update Local Cache
    const current = getLocalCache();
    setLocalCache([sanitizedLoker, ...current]);

    // 5. Cloud Persist via Firestore
    if (isFirebaseConfigured()) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lokers?documentId=${newId}&key=${firebaseConfig.apiKey}`;
        const fields = toFirestoreFields(sanitizedLoker);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn("[LokerORM] Cloud create warning:", errData);
          return {
            success: true,
            data: sanitizedLoker,
            error: `Tersimpan secara lokal. Cloud Firestore notice: ${errData?.error?.message || "Cek Rules"}`,
          };
        }
      } catch (err: any) {
        return {
          success: true,
          data: sanitizedLoker,
          error: `Tersimpan lokal: ${err?.message}`,
        };
      }
    }

    return { success: true, data: sanitizedLoker };
  }

  /**
   * Update an existing loker record (Protected by Admin PIN)
   */
  static async update(
    id: string,
    dto: UpdateLokerDTO,
    adminPin: string
  ): Promise<{ success: boolean; data?: WfaLoker; error?: string }> {
    if (!verifyAdminPin(adminPin)) {
      return { success: false, error: "Akses ditolak: PIN Keamanan Admin tidak valid!" };
    }

    const validationErrors = validateLokerDTO(dto, false);
    if (validationErrors.length > 0) {
      return { success: false, error: validationErrors.join(" ") };
    }

    const current = getLocalCache();
    const index = current.findIndex((item) => item.id === id);
    if (index === -1) {
      return { success: false, error: "Data lowongan kerja tidak ditemukan." };
    }

    const existing = current[index];
    const updated: WfaLoker = {
      ...existing,
      ...(dto.title !== undefined ? { title: sanitizeString(dto.title) } : {}),
      ...(dto.companyName !== undefined ? { companyName: sanitizeString(dto.companyName) } : {}),
      ...(dto.thumbnailUrl !== undefined ? { thumbnailUrl: sanitizeUrl(dto.thumbnailUrl) } : {}),
      ...(dto.salaryEstimate !== undefined ? { salaryEstimate: sanitizeString(dto.salaryEstimate) } : {}),
      ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
      ...(dto.mode !== undefined ? { mode: dto.mode } : {}),
      ...(dto.locationType !== undefined ? { locationType: dto.locationType } : {}),
      ...(dto.offlineAddress !== undefined ? { offlineAddress: sanitizeString(dto.offlineAddress) } : {}),
      ...(dto.applyUrl !== undefined ? { applyUrl: sanitizeUrl(dto.applyUrl) } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.category !== undefined ? { category: dto.category } : {}),
      updatedAt: new Date().toISOString(),
    };

    // If switched from On-site to Remote, clean offlineAddress
    if (updated.locationType === "Remote") {
      delete updated.offlineAddress;
    }

    current[index] = updated;
    setLocalCache(current);

    if (isFirebaseConfigured()) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lokers/${id}?key=${firebaseConfig.apiKey}`;
        const fields = toFirestoreFields(updated);
        await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });
      } catch (err: any) {
        console.warn("[LokerORM] Cloud update error:", err);
      }
    }

    return { success: true, data: updated };
  }

  /**
   * Delete a loker record (Protected by Admin PIN)
   */
  static async delete(id: string, adminPin: string): Promise<{ success: boolean; error?: string }> {
    if (!verifyAdminPin(adminPin)) {
      return { success: false, error: "Akses ditolak: PIN Keamanan Admin tidak valid!" };
    }

    const current = getLocalCache();
    const filtered = current.filter((l) => l.id !== id);
    setLocalCache(filtered);

    if (isFirebaseConfigured()) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lokers/${id}?key=${firebaseConfig.apiKey}`;
        await fetch(url, { method: "DELETE" });
      } catch (err: any) {
        console.warn("[LokerORM] Cloud delete error:", err);
      }
    }

    return { success: true };
  }

  /**
   * Toggle status between ACTIVE and CLOSED (Protected by Admin PIN)
   */
  static async toggleStatus(id: string, adminPin: string): Promise<{ success: boolean; data?: WfaLoker; error?: string }> {
    const loker = await this.findById(id);
    if (!loker) return { success: false, error: "Loker tidak ditemukan" };
    const nextStatus = loker.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    return this.update(id, { status: nextStatus }, adminPin);
  }

  /**
   * Seed curated sample data into Cloud Firestore
   */
  static async seedSampleData(adminPin: string): Promise<{ success: boolean; count: number; message: string }> {
    if (!verifyAdminPin(adminPin)) {
      return { success: false, count: 0, message: "Akses ditolak: PIN Keamanan Admin tidak valid!" };
    }

    let successCount = 0;
    for (const sample of initialWfaLokers) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/lokers?documentId=${sample.id}&key=${firebaseConfig.apiKey}`;
        const fields = toFirestoreFields(sample);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });
        if (res.ok) successCount++;
      } catch {
        // continue
      }
    }

    return {
      success: successCount > 0,
      count: successCount,
      message: `Berhasil mengunggah ${successCount} data contoh lowongan ke Cloud Firestore (${firebaseConfig.projectId})!`,
    };
  }
}
