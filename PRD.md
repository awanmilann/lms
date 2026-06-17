# PRD: LMS CBT (Computer-Based Testing) Platform

## TL;DR
Membangun Learning Management System dengan Computer-Based Testing (CBT) menggunakan Next.js + Tailwind CSS. Platform ini memungkinkan guru/administrator membuat dan mengelola ujian online, serta siswa mengerjakan ujian dengan sistem auto-scoring untuk soal objektif dan manual grading untuk soal esai.

## Background
Saat ini belum ada sistem ujian online yang terintegrasi. Ujian masih dilakukan manual (kertas). Kebutuhan akan platform CBT meningkat dengan adanya pembelajaran jarak jauh dan kebutuhan efisiensi koreksi.

## Problem & Target Users
- **Sekolah/Institusi Pendidikan** — butuh platform ujian online yang simpel dan reliable
- **Guru/Administrator** — ingin buat soal & ujian tanpa ribet, dapat hasil instan
- **Siswa** — butuh antarmuka ujian yang fokus, nggak bingung, aman dari kecurangan

**Pain points:**
- Koreksi manual memakan waktu berhari-hari
- Soal hilang atau rusak karena media fisik
- Sulit mendeteksi kecurangan
- Tidak ada analisis hasil ujian secara otomatis

## Goals & Success Metrics
- **MVP Launch**: Platform siap dipakai dalam 2-3 minggu
- **Auto-scoring accuracy**: 100% untuk soal objektif (pilihan ganda)
- **Exam uptime**: Ujian tidak boleh crash saat sedang berlangsung
- **Load**: Support minimal 100 siswa ujian bersamaan

## Solution Overview
Web app monolitik dengan Next.js (App Router):

### Role System
1. **Super Admin** — full akses
2. **Guru/Proktor** — bikin soal, kelola ujian, lihat hasil
3. **Siswa** — kerjakan ujian, lihat hasil

### Fitur Utama

**Phase 1 (MVP)**
- Auth (login/register)
- Dashboard (per-role)
- Manajemen bank soal (CRUD) — multiple choice, essay
- Manajemen ujian (buat, atur waktu, publish)
- Halaman ujian (timer, navigasi soal, auto-submit)
- Scoring otomatis (MC) + manual (essay)
- Lihat hasil & rekap nilai

**Phase 2 (Post-MVP)**
- Random soal per siswa
- Analisis statistik (grafik, distribusi nilai)
- Export PDF nilai
- Anti-cheat (acak opsi, flagging tab switch)
- Manajemen kelas & siswa
- Impor soal dari Excel

## User Experience

### Flow Guru
Login → Dashboard → Buat Ujian Baru / Kelola Soal → Atur jadwal & durasi → Publish → Pantau realtime → Lihat hasil setelah selesai

### Flow Siswa
Login → Dashboard (daftar ujian aktif) → Masuk ruang ujian → Konfirmasi → Kerjakan soal (navigasi, timer) → Submit → Lihat skor (jika sudah dinilai semua)

## Requirements

### Auth
- Register (role: siswa/guru)
- Login with email & password
- Session management (JWT / NextAuth)
- Middleware proteksi route per role

### Bank Soal
- CRUD soal dengan kategori (mapel, kelas, topik)
- Tipe soal: Pilihan Ganda (1 jawaban benar) & Esai
- Upload gambar di soal
- Preview soal sebelum dipakai

### Manajemen Ujian
- Pilih soal dari bank soal (bisa filter by kategori)
- Atur: judul, durasi, waktu mulai, waktu selesai
- Status: draft → publish → ongoing → completed
- Generate token/password ujian (opsional)

### Halaman Ujian (Siswa)
- Full-screen mode (rekomendasi)
- Sidebar navigasi soal (nomor, status jawaban)
- Timer countdown (auto-submit jika waktu habis)
- Konfirmasi submit
- Tidak bisa kembali setelah submit

### Scoring
- Pilihan Ganda — auto score langsung setelah submit
- Esai — guru harus nilai manual satu per satu
- Rekap: total nilai, jawaban benar/salah, status

### Dashboard
- Guru: statistik ujian, ujian aktif, hasil terkini
- Siswa: ujian yang akan datang, riwayat nilai

## Out of Scope (MVP)
- Live proctoring (camera/audio monitoring)
- Adaptive testing
- AI-based cheating detection
- Mobile app native
- Real-time collaboration

## Assumptions (Quick Mode)
| Asumsi | Confidence |
|--------|-----------|
| Pakai PostgreSQL via Vercel Postgres / Neon | High |
| NextAuth.js untuk authentication | High |
| UI pakai shadcn/ui di atas Tailwind | High |
| Jumlah user awal < 1000 | High |
| Deployment di Vercel | Medium |
