import { describe, it, expect, afterEach } from "vitest";
import { getSupabaseEnv } from "@/lib/supabase/env";

describe("getSupabaseEnv", () => {
  const original = { ...process.env };
  afterEach(() => { process.env = { ...original }; });

  it("mengembalikan url & anonKey kalau env lengkap", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xyz.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-dummy";
    expect(getSupabaseEnv()).toEqual({ url: "https://xyz.supabase.co", anonKey: "anon-key-dummy" });
  });

  it("melempar error jelas kalau url kosong", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-dummy";
    expect(() => getSupabaseEnv()).toThrow(/Konfigurasi Supabase belum lengkap/);
  });

  it("melempar error jelas kalau anonKey kosong", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xyz.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => getSupabaseEnv()).toThrow(/Konfigurasi Supabase belum lengkap/);
  });
});
