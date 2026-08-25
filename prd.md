# Product Requirements Document (PRD)
# WFA JOB — Job Matching Platform dengan Escrow & Trust System
 
**Versi:** 1.0 (MVP Standalone)
**Status:** Draft untuk mulai development
**Scope:** Platform berdiri sendiri, **tanpa integrasi apapun dengan Sekolah WFA**
 
---
 
## 1. Ringkasan Produk
 
WFA JOB adalah platform *job matching* untuk pekerja lepas lintas kategori (creative, virtual assisting, dev & web, gaming, dll) yang dilengkapi sistem rekening bersama (**escrow**) dan mata uang internal (**WFD**) sebagai lapisan kepercayaan transaksi antara **Worker** (pekerja) dan **Boss** (pemberi kerja).
 
Di versi MVP standalone ini, seluruh fitur yang bergantung pada ekosistem Sekolah WFA (capstone project, instructor co-sign, warm-start boss network, cohort squad, gated cohort release, verified graduate badge) **dihilangkan sepenuhnya**. Worker & Boss mendaftar mandiri seperti platform freelance pada umumnya (mirip Fiverr/Upwork versi lokal), dengan diferensiasi utama ada di **kualitas trust/escrow system** dan **UX mobile yang sangat sederhana**.
 
### 1.1 Tujuan Produk
- Menyediakan marketplace job matching yang aman lewat sistem escrow, tanpa Worker/Boss perlu saling percaya secara manual.
- Memberikan pengalaman mobile-first yang sangat mudah dipakai — minim friksi saat posting job, submit bid, dan withdraw dana.
- Membangun fondasi teknis yang bisa di-scale nanti (multi-kategori, payment partner, dispute engine).
### 1.2 Non-Goals (Sengaja Tidak Dikerjakan di Fase Ini)
- ❌ Integrasi dengan Sekolah WFA / LMS / sistem kelas apapun.
- ❌ Fitur capstone, instructor, cohort, atau badge kelulusan.
- ❌ Mengurus izin PJP sendiri — pembayaran di-orchestrate lewat payment partner berizin (Xendit/Midtrans), platform **tidak pernah menjadi custodian dana** secara hukum.
- ❌ Desktop-first layout — desktop diabaikan dulu, fokus 100% mobile web (responsive dasar untuk desktop cukup "tidak rusak", bukan dioptimasi).
- ❌ Native app (iOS/Android) — cukup mobile web yang terasa seperti app (PWA-ready).
---
 
## 2. Target Pengguna
 
| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Worker** | Freelancer individu, mayoritas akses dari HP, kategori: desain, video, VA, dev, dsb. | Cari job cepat, submit bid/klaim spot gampang, tau kapan dana cair, withdraw gampang. |
| **Boss** | Individu/UMKM/bisnis kecil yang butuh jasa lepas. | Posting job cepat, pilih worker terpercaya, dana aman sampai kerjaan beres. |
| **Admin (internal)** | Tim ops WFA JOB. | Review KYC, mediasi dispute, monitor transaksi mencurigakan. |
 
---
 
## 3. Prinsip UI/UX (Wajib Dipegang Selama Development)
 
1. **Mobile-first murni** — semua desain, spacing, dan flow dirancang untuk layar 360–430px dulu. Desktop menyusul di fase lain.
2. **Clean, simple, professional** — whitespace cukup, tipografi jelas (max 2 font family), warna terbatas (1 primary + 1 accent + neutral scale). Hindari elemen dekoratif generik (accent bar di bawah judul, garis pelangi, dsb — terasa "AI slop").
3. **Zero-confusion input** — setiap form pakai:
   - Step-by-step wizard untuk alur panjang (post job, KYC, withdraw), bukan 1 form panjang.
   - Validasi inline real-time (Zod + React Hook Form), bukan alert setelah submit.
   - Progress indicator jelas di setiap wizard (dots/step bar).
4. **Visual & bernyawa** — bukan UI flat kosong. Setiap page utama punya:
   - Icon set konsisten (Lucide/Phaser custom) sesuai konteks kategori job.
   - Micro-interaction via **GSAP** (transisi antar step, skeleton→content reveal, celebratory animation saat dana cair/job selesai, pull-to-refresh feel).
   - Empty state yang ilustratif (bukan teks kosong "tidak ada data") — pakai ilustrasi ringan SVG.
5. **Bottom navigation, bukan hamburger menu** — 4-5 tab utama selalu terlihat, sesuai pola app mobile native.
6. **Satu aksi utama per layar** — setiap screen punya 1 CTA primer yang jelas secara visual (warna solid, posisi sticky bottom bila perlu).
7. **Status transaksi selalu terlihat** — worker & boss harus selalu bisa lihat "dana dimana sekarang" tanpa harus tanya (badge status: Locked in Escrow / Released / Pending Review, dsb) dengan warna & ikon konsisten.
---
 
## 4. Arsitektur Fitur (3 Lapisan)
 
Sesuai konsep dasar pitch — tetap dipertahankan, minus elemen sekolah:
 
| Lapisan | Isi | Kompleksitas |
|---|---|---|
| **Marketplace Layer** | Posting job, browsing, bid/spot, profil, rating | Standar |
| **Trust/Escrow Layer** | Wallet, lock dana, milestone release, dispute | Tinggi (perlu payment partner) |
| **Currency Layer (WFD)** | Saldo internal, konversi ke Rupiah saat withdraw | Perlu kehati-hatian regulasi — treat sebagai *ledger internal*, bukan alat tukar antar user |
 
---
 
## 5. Fitur MVP (Detail)
 
### 5.1 Autentikasi & Onboarding
- Sign up / login via Supabase Auth: email+password, dan Google OAuth.
- Pilih role saat onboarding: **Worker**, **Boss**, atau keduanya (bisa switch role dari profil).
- Onboarding wizard singkat (max 3 step): nama, kategori minat (worker) / jenis kebutuhan (boss), nomor HP (verifikasi OTP via Supabase).
- KYC ringan: verifikasi HP wajib untuk semua; verifikasi identitas (foto KTP + selfie) wajib **hanya saat mau withdraw pertama kali** — supaya onboarding tetap ringan di awal (mengurangi friksi drop-off).
### 5.2 Marketplace — Posting & Browsing Job
- **Dua mode posting job (dipertahankan dari pitch):**
  - **Bid Mode** — job custom/kompleks, 1 worker terpilih dari beberapa bid masuk.
  - **Spot Mode** — microtask volume tinggi, first-come-first-served, banyak worker sekaligus, ada limit klaim per worker per job (anti sybil).
- Form posting job berupa wizard: Kategori → Detail & Deadline → Budget → Review & Publish. Auto-generate ringkasan kontrak digital (scope, deadline, nominal) begitu job dipublish.
- Feed job untuk worker: filter kategori, sort (terbaru/budget tertinggi/deadline terdekat), search.
- Job detail page: deskripsi, budget, deadline, jumlah bid masuk/spot terisi, profil Boss (rating, jumlah job selesai).
### 5.3 Bid & Spot Flow
- **Worker (Bid Mode):** submit proposal (pesan + harga tawaran) → Boss review semua bid → Boss pilih 1 pemenang → job berpindah status "In Progress", dana ter-lock di escrow otomatis.
- **Worker (Spot Mode):** tap "Klaim Spot" → dapat slot terkunci dengan claim timer (misal 15 menit untuk submit hasil) → auto-release slot bila timeout.
### 5.4 Escrow / Trust Layer
- Boss top-up saldo (WFD) via payment gateway (Xendit/Midtrans — kartu, VA, e-wallet, QRIS).
- Saat job dimulai, dana otomatis ter-*lock* di escrow (status: **Locked**).
- **Milestone release** — untuk job Bid Mode besar, Boss bisa pecah pembayaran per milestone; dana cair bertahap saat tiap milestone di-approve.
- **Auto-release timer** — bila Boss tidak review hasil kerja dalam waktu tertentu (misal 3x24 jam), dana otomatis cair ke Worker (proteksi worker dari boss yang menghilang).
- **Partial refund/release** — dana bisa displit sesuai proporsi pekerjaan yang benar-benar selesai (untuk kasus dispute sebagian).
- Status escrow selalu tampil jelas di UI: `Locked` → `Released` → `Withdrawn`.
### 5.5 WFD (Wallet Internal)
- WFD adalah saldo internal (ledger), 1 WFD = 1 Rupiah secara nilai, **tidak bisa ditransfer antar user secara bebas** (hanya sebagai representasi saldo escrow/wallet, bukan alat tukar bebas — untuk menghindari masuk kategori e-money/forex).
- Konversi ke Rupiah riil terjadi **hanya di titik withdraw**.
- Withdrawal: minimum threshold (setara ~Rp75.000/$5), fee flat Rp2.500/transaksi, wajib 2FA.
- Riwayat transaksi lengkap (top-up, lock, release, withdraw) dapat diakses di halaman Wallet.
### 5.6 Dispute Resolution (Versi Ringkas MVP)
- Worker/Boss bisa ajukan dispute dari halaman job (wajib lampirkan bukti: screenshot/file).
- **Fast-track micro-dispute** untuk job Spot Mode (nominal kecil) — keputusan biner otomatis berdasarkan bukti submission (tanpa admin manual bila jelas).
- Dispute untuk Bid Mode / nominal besar → masuk antrian admin manual (dashboard admin terpisah, di luar scope MVP user-facing, cukup internal tool sederhana).
- (Fase lanjutan: mediasi berbasis AI — di luar scope MVP awal.)
### 5.7 Rating, Level & Profil
- Rating 2 arah (Worker↔Boss) setelah job selesai.
- Tier worker: **Starter → Senior → Expert**, dihitung dari akumulasi GMV realisasi (bukan saldo top-up). Tier memengaruhi persentase fee komisi (10%/15%/20%, tiered — sesuai model monetisasi pitch, dipertahankan).
- Profil publik: bio, kategori keahlian, portofolio ringkas (upload gambar via Supabase Storage), rating, badge tier.
### 5.8 Notifikasi
- In-app notification center (real-time via Supabase Realtime): bid baru masuk, job dipilih, dana cair, deadline mendekat, dispute update.
- (Push notification browser — opsional fase 2 via PWA.)
### 5.9 Chat Ringan per Job
- Chat sederhana terikat per job (bukan chat global), untuk klarifikasi brief antara Worker-Boss. Realtime via Supabase Realtime channel per job.
---
 
## 6. Peta Layar (Mobile-First — Bottom Nav 5 Tab)
 
```
[Home/Feed]  [Job Saya]  [+ Post/Cari]  [Wallet]  [Profil]
```
 
| Tab | Screen Utama |
|---|---|
| **Home** | Feed job (Worker) atau ringkasan aktivitas (Boss) — konten adaptif sesuai role aktif |
| **Job Saya** | List job berjalan/selesai (bid diajukan, job diposting, in-progress, completed) dengan status badge |
| **+ (Tengah, CTA utama)** | Worker → cari/filter job; Boss → wizard Post Job |
| **Wallet** | Saldo WFD, riwayat transaksi, tombol Top-Up & Withdraw |
| **Profil** | Info akun, switch role, rating, pengaturan, KYC status |
 
Layar pendukung (diakses dari dalam flow, bukan tab): Job Detail, Submit Bid, Chat per Job, Dispute Center, Withdraw Wizard, Top-Up Wizard, Notifikasi, Onboarding.
 
---
 
## 7. Tech Stack
 
| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR/ISR untuk feed job, API routes untuk backend ringan, siap PWA |
| Database & ORM | **Supabase (Postgres) + Prisma ORM** | Prisma untuk schema & migration yang aman, Supabase sebagai host Postgres + Auth + Realtime + Storage |
| Auth | **Supabase Auth** | Email/password, OAuth Google, OTP HP |
| Realtime | **Supabase Realtime** | Notifikasi, chat per job, update status bid live |
| Storage | **Supabase Storage** | Upload KTP (private bucket), portofolio, attachment dispute |
| Data fetching (client) | **SWR** | Caching, revalidate on focus, optimistic update saat submit bid/aksi wallet |
| Styling | **Tailwind CSS** | Utility-first, cepat untuk mobile-first responsive |
| Komponen dasar | **shadcn/ui** (dikustomisasi total, bukan default look) | Base komponen aksesibel, tetap dioverride sesuai desain unik |
| Animasi | **GSAP** (+ ScrollTrigger untuk feed, Flip untuk transisi kartu) | Micro-interaction halus: step wizard, reveal, celebratory success state |
| Form & Validasi | **React Hook Form + Zod** | Validasi inline real-time, schema-based |
| State ringan client | **Zustand** | Role aktif (Worker/Boss), state UI global ringan |
| Ikon | **Lucide React** | Icon set konsisten, ringan |
| Payment Gateway | **Xendit / Midtrans (server-side integration)** | Orchestration split-payment, platform tidak custody dana secara hukum |
| Hosting | **Vercel** | Native Next.js deployment, edge caching |
| PWA | **next-pwa / Serwist** | Installable mobile web app, offline shell dasar |
 
---
 
## 8. Data Model (Prisma — Skema Inti)
 
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  phone         String?  @unique
  name          String
  avatarUrl     String?
  activeRole    Role     @default(WORKER)
  isPhoneVerified Boolean @default(false)
  kycStatus     KycStatus @default(NONE)
  tier          WorkerTier @default(STARTER)
  gmvRealized   Decimal  @default(0)
  createdAt     DateTime @default(now())
 
  jobsPosted    Job[]      @relation("BossJobs")
  bids          Bid[]
  walletId      String?    @unique
  wallet        Wallet?
  ratingsGiven  Rating[]   @relation("RatingGiver")
  ratingsReceived Rating[] @relation("RatingReceiver")
}
 
enum Role { WORKER BOSS }
enum KycStatus { NONE PENDING VERIFIED REJECTED }
enum WorkerTier { STARTER SENIOR EXPERT }
 
model Job {
  id          String   @id @default(cuid())
  bossId      String
  boss        User     @relation("BossJobs", fields: [bossId], references: [id])
  title       String
  description String
  category    String
  mode        JobMode
  budget      Decimal
  deadline    DateTime
  status      JobStatus @default(OPEN)
  spotLimit   Int?      // hanya untuk SPOT mode
  createdAt   DateTime  @default(now())
 
  bids        Bid[]
  escrow      Escrow?
  milestones  Milestone[]
  dispute     Dispute?
}
 
enum JobMode { BID SPOT }
enum JobStatus { OPEN IN_PROGRESS SUBMITTED COMPLETED CANCELLED DISPUTED }
 
model Bid {
  id        String   @id @default(cuid())
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id])
  workerId  String
  worker    User     @relation(fields: [workerId], references: [id])
  message   String
  price     Decimal
  status    BidStatus @default(PENDING)
  createdAt DateTime @default(now())
}
 
enum BidStatus { PENDING ACCEPTED REJECTED }
 
model Escrow {
  id           String   @id @default(cuid())
  jobId        String   @unique
  job          Job      @relation(fields: [jobId], references: [id])
  amountWFD    Decimal
  status       EscrowStatus @default(LOCKED)
  autoReleaseAt DateTime?
  lockedAt     DateTime @default(now())
  releasedAt   DateTime?
}
 
enum EscrowStatus { LOCKED PARTIALLY_RELEASED RELEASED REFUNDED }
 
model Milestone {
  id        String   @id @default(cuid())
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id])
  title     String
  amount    Decimal
  status    MilestoneStatus @default(PENDING)
}
 
enum MilestoneStatus { PENDING SUBMITTED APPROVED RELEASED }
 
model Wallet {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  balanceWFD  Decimal  @default(0)
  transactions Transaction[]
}
 
model Transaction {
  id        String   @id @default(cuid())
  walletId  String
  wallet    Wallet   @relation(fields: [walletId], references: [id])
  type      TxType
  amount    Decimal
  status    TxStatus @default(SUCCESS)
  refId     String?  // job/withdraw reference
  createdAt DateTime @default(now())
}
 
enum TxType { TOPUP LOCK RELEASE WITHDRAW FEE REFUND }
enum TxStatus { PENDING SUCCESS FAILED }
 
model Dispute {
  id          String   @id @default(cuid())
  jobId       String   @unique
  job         Job      @relation(fields: [jobId], references: [id])
  raisedById  String
  reason      String
  evidenceUrl String?
  resolution  String?
  status      DisputeStatus @default(OPEN)
  createdAt   DateTime @default(now())
}
 
enum DisputeStatus { OPEN FAST_TRACK_RESOLVED MANUAL_REVIEW RESOLVED }
 
model Rating {
  id          String   @id @default(cuid())
  jobId       String
  fromUserId  String
  fromUser    User     @relation("RatingGiver", fields: [fromUserId], references: [id])
  toUserId    String
  toUser      User     @relation("RatingReceiver", fields: [toUserId], references: [id])
  score       Int      // 1-5
  comment     String?
  createdAt   DateTime @default(now())
}
```
 
---
 
## 9. Model Monetisasi (Dipertahankan dari Pitch)
 
| Sumber | Nilai |
|---|---|
| Commission fee (tiered by GMV) | Starter 10% · Senior 15% · Expert 20% |
| Post job fee | $0.1 flat/posting (jadi kredit ke commission bila job selesai; hangus bila dibatalkan) |
| Withdrawal fee | Rp2.500 flat/transaksi (pass-through, bukan profit center) |
| Founding Worker Bonus | 100–500 worker pertama mulai di tier Senior selama periode promosi (insentif cold-start — **catatan: mekanisme ini generik, tidak terikat status lulusan sekolah manapun**) |
 
---
 
## 10. Manajemen Risiko & Fraud (Tetap Relevan untuk Standalone)
 
| Risiko | Mitigasi di Produk |
|---|---|
| Off-platform leakage | Insentif in-platform: rating, proteksi escrow, warranty tidak didapat di luar platform |
| Chargeback fraud | Verifikasi metode pembayaran + hold period sebelum withdraw |
| Money laundering | Limit transaksi, KYC berlapis, monitoring pola mencurigakan |
| Sybil/spot abuse | Verifikasi HP & device, limit 1 spot/worker/job |
| Dispute abuse | Fast-track micro-dispute + bukti wajib |
| Account takeover | 2FA wajib khusus aksi withdrawal |
 
---
 
## 11. Regulasi (Catatan Wajib untuk Tim Dev)
 
- Sejak PBI No. 10/2025, pihak yang menahan/menyalurkan dana pengguna wajib izin PJP. **WFA JOB tidak mengurus izin PJP sendiri di MVP** — seluruh custody dana dilakukan lewat payment partner berizin (Xendit/Midtrans split-payment/disbursement API).
- WFD wajib diposisikan sebagai **ledger internal representasi saldo**, bukan alat tukar bebas antar pengguna, untuk menghindari klasifikasi e-money/forex.
- Platform berpotensi masuk kriteria pemungut pajak sesuai aturan berlaku Juli 2026 — perlu review lanjutan bersama legal sebelum go-live publik (di luar scope teknis PRD ini, dicatat sebagai *dependency*).
---
 
## 12. Non-Functional Requirements
 
- **Performance:** First Contentful Paint < 1.5s di koneksi 4G rata-rata Indonesia; gunakan ISR/streaming untuk feed job.
- **Mobile responsiveness:** Wajib teruji baik di lebar 360px–430px (Android kelas menengah paling umum di Indonesia).
- **Accessibility dasar:** Kontras warna cukup, target tap area minimum 44x44px.
- **Security:** Semua endpoint sensitif (wallet, withdraw, KYC) via server-side route dengan validasi role & ownership; Row Level Security (RLS) aktif di Supabase untuk semua tabel user-facing.
- **Observability:** Log semua transaksi wallet & perubahan status escrow untuk audit trail.
---
 
## 13. Roadmap Fase (Standalone)
 
| Fase | Fokus |
|---|---|
| **Fase 0 — Foundation** | Setup Next.js + Prisma + Supabase, Auth, skema DB, design system dasar (komponen, warna, tipografi) |
| **Fase 1 — MVP Core** | Auth & onboarding, posting job (Bid & Spot), browsing/feed, submit bid/klaim spot, wallet dasar (top-up manual/sandbox payment), escrow lock/release manual-trigger |
| **Fase 2 — Trust Layer Penuh** | Integrasi payment gateway riil (Xendit/Midtrans), milestone release, auto-release timer, withdraw flow lengkap + KYC |
| **Fase 3 — Dispute & Rating** | Dispute center (fast-track + manual queue admin), rating 2 arah, tier worker otomatis dari GMV |
| **Fase 4 — Polish & Growth** | Notifikasi realtime, chat per job, PWA install prompt, animasi GSAP penuh di seluruh flow, admin dashboard internal |
 
---
 
## 14. Metrik Sukses (MVP)
 
- Time-to-first-bid (dari job diposting sampai bid pertama masuk).
- % job yang selesai tanpa dispute.
- Drop-off rate di setiap step onboarding & wizard post-job (target: tidak ada step dengan drop >20%).
- Waktu rata-rata dari "job completed" sampai "dana released".
- Retention worker (aktif submit bid dalam 7 hari setelah signup).
---