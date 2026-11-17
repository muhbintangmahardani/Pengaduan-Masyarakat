import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export const LIVE_CHANNEL_NAME = "jalanbaik-live-room";
export const COMPLAINT_EVENT_NAME = "complaint_event";
export const CROSS_TAB_CHANNEL = "jalanbaik-cross-tab-v1";

export interface BroadcastComplaintData {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  user_id: string;
  assigned_officer_id?: string | null;
  updated_at?: string;
  created_at?: string;
}

export interface BroadcastComplaintPayload {
  eventType: "INSERT" | "UPDATE";
  complaint: BroadcastComplaintData;
  actionType?: "CREATED" | "ASSIGNED" | "WORK_SUBMITTED" | "RESOLVED" | "REWORK_REQUESTED";
  actorRole: "citizen" | "officer" | "admin";
}

/**
 * Mengirimkan event broadcast WebSocket seketika ke seluruh klien aktif (jalanbaik-live-room)
 * Bekerja langsung di level server action tanpa ketergantungan PostgreSQL publication
 */
export async function broadcastComplaintEvent(
  payload: BroadcastComplaintPayload
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceKey) return;

    const supabase = createSupabaseClient(supabaseUrl, serviceKey);
    const channel = supabase.channel(LIVE_CHANNEL_NAME);

    await new Promise<void>((resolve) => {
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            await channel.send({
              type: "broadcast",
              event: COMPLAINT_EVENT_NAME,
              payload,
            });
            // Buffer waktu 200ms agar WebSocket frame terkirim tuntas sebelum koneksi dilepas
            await new Promise((r) => setTimeout(r, 200));
          } catch (sendErr) {
            console.warn("Gagal mengirim broadcast frame:", sendErr);
          } finally {
            try {
              supabase.removeChannel(channel);
            } catch {}
            resolve();
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          resolve();
        }
      });

      // Safety timeout maksimal 2.5 detik agar server action tidak terblokir
      setTimeout(() => resolve(), 2500);
    });
  } catch (err) {
    console.warn("Gagal menyiarkan broadcast realtime:", err);
  }
}

// =========================================================================
// SINGLETON CLIENT-SIDE LISTENER MANAGER
// Mencegah error Supabase "cannot add callbacks after subscribe()"
// =========================================================================
let activeLiveChannel: any = null;
let activeBroadcastChannel: BroadcastChannel | null = null;
const liveListeners = new Set<(payload: BroadcastComplaintPayload) => void>();

/**
 * Berlangganan event jalanbaik-live-room secara aman dari komponen manapun di sisi klien.
 * Menggunakan 1 koneksi WebSocket tunggal terbagi (shared) bebas bentrok.
 */
export function subscribeToLiveRoom(
  callback: (payload: BroadcastComplaintPayload) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  liveListeners.add(callback);

  // Buat dan subscribe channel hanya SEKALI
  if (!activeLiveChannel) {
    try {
      const supabase = createBrowserClient();
      activeLiveChannel = supabase.channel(LIVE_CHANNEL_NAME, {
        config: { broadcast: { self: true } },
      });

      // Pasang semua listener SEBELUM memanggil .subscribe()
      activeLiveChannel
        .on(
          "broadcast",
          { event: COMPLAINT_EVENT_NAME },
          ({ payload }: { payload: any }) => {
            if (payload && payload.complaint) {
              for (const cb of Array.from(liveListeners)) {
                try {
                  cb(payload);
                } catch (err) {
                  console.warn("Live listener error:", err);
                }
              }
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "complaints" },
          (payload: any) => {
            const record = payload.new;
            if (record && Object.keys(record).length > 0) {
              const mapped: BroadcastComplaintPayload = {
                eventType: payload.eventType,
                complaint: record,
                actorRole: "admin",
              };
              for (const cb of Array.from(liveListeners)) {
                try {
                  cb(mapped);
                } catch (err) {
                  console.warn("Postgres changes listener error:", err);
                }
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Gagal inisialisasi live channel:", err);
    }
  }

  // Siapkan listener cross-tab HTML5 jika belum ada
  if (!activeBroadcastChannel && "BroadcastChannel" in window) {
    try {
      activeBroadcastChannel = new BroadcastChannel(CROSS_TAB_CHANNEL);
      activeBroadcastChannel.onmessage = (event) => {
        const payload = event.data as BroadcastComplaintPayload;
        if (payload && payload.complaint) {
          for (const cb of Array.from(liveListeners)) {
            try {
              cb(payload);
            } catch (err) {
              console.warn("Cross-tab listener error:", err);
            }
          }
        }
      };
    } catch {}
  }

  // Fungsi unsubscribe bersih
  return () => {
    liveListeners.delete(callback);

    // Lepas channel jika tidak ada lagi komponen yang mendengarkan
    if (liveListeners.size === 0) {
      if (activeLiveChannel) {
        try {
          const supabase = createBrowserClient();
          supabase.removeChannel(activeLiveChannel);
        } catch {}
        activeLiveChannel = null;
      }
      if (activeBroadcastChannel) {
        try {
          activeBroadcastChannel.close();
        } catch {}
        activeBroadcastChannel = null;
      }
    }
  };
}

/**
 * Helper sisi klien untuk menyinkronkan antar tab peramban lokal & listener aktif (0ms delay)
 */
export function emitLocalCrossTab(payload: BroadcastComplaintPayload): void {
  if (typeof window === "undefined") return;

  // 1. Eksekusi langsung ke listener di tab saat ini (0ms)
  for (const cb of Array.from(liveListeners)) {
    try {
      cb(payload);
    } catch (err) {
      console.warn("Local dispatch error:", err);
    }
  }

  // 2. Siarkan ke tab peramban lain
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel(CROSS_TAB_CHANNEL);
      bc.postMessage(payload);
      bc.close();
    }
  } catch {}
}
