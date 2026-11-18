export interface HttpErrorDefinition {
  code: number;
  name: string;
  title: string;
  description: string;
  category: "Client Error (4xx)" | "Server Error (5xx)";
  solution: string;
  badgeVariant: "default" | "destructive" | "secondary" | "outline";
  badgeClass: string;
}

export const HTTP_ERRORS: Record<number, HttpErrorDefinition> = {
  400: {
    code: 400,
    name: "Bad Request",
    title: "Permintaan Tidak Valid",
    description: "Permintaan tidak dapat diproses karena format atau URL tidak valid.",
    category: "Client Error (4xx)",
    solution: "Periksa kembali URL yang Anda tuju atau data formulir yang Anda kirimkan sebelum mencoba kembali.",
    badgeVariant: "secondary",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
  401: {
    code: 401,
    name: "Unauthorized",
    title: "Autentikasi Diperlukan",
    description: "Perlu login atau autentikasi terlebih dahulu.",
    category: "Client Error (4xx)",
    solution: "Sesi login Anda belum aktif atau telah berakhir. Silakan masuk dengan akun Anda untuk melanjutkan.",
    badgeVariant: "secondary",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800",
  },
  403: {
    code: 403,
    name: "Forbidden",
    title: "Akses Halaman Ditolak",
    description: "Anda tidak memiliki izin akses ke halaman tersebut.",
    category: "Client Error (4xx)",
    solution: "Akun Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan kembali ke dashboard role Anda.",
    badgeVariant: "destructive",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800",
  },
  408: {
    code: 408,
    name: "Request Timeout",
    title: "Waktu Permintaan Habis",
    description: "Waktu tunggu permintaan habis sebelum server merespons.",
    category: "Client Error (4xx)",
    solution: "Koneksi internet Anda mungkin lambat atau terputus sementara. Periksa jaringan Anda dan coba muat ulang.",
    badgeVariant: "secondary",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800",
  },
  429: {
    code: 429,
    name: "Too Many Requests",
    title: "Batas Permintaan Terlampaui",
    description: "Terlalu banyak permintaan dikirim dalam waktu singkat.",
    category: "Client Error (4xx)",
    solution: "Sistem membatasi laju permintaan untuk menjaga kestabilan layanan. Mohon tunggu sesaat sebelum mencoba kembali.",
    badgeVariant: "secondary",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800",
  },
  500: {
    code: 500,
    name: "Internal Server Error",
    title: "Kesalahan Internal Server",
    description: "Terjadi kesalahan umum atau bug pada server.",
    category: "Server Error (5xx)",
    solution: "Terjadi kendala teknis pada server kami saat memproses permintaan Anda. Tim kami telah mencatat kendala ini.",
    badgeVariant: "destructive",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800",
  },
  502: {
    code: 502,
    name: "Bad Gateway",
    title: "Gateway Tidak Valid",
    description: "Server perantara mendapat respons tidak valid dari server upstream.",
    category: "Server Error (5xx)",
    solution: "Server gateway atau proxy penghubung gagal menerima respons yang benar dari server backend.",
    badgeVariant: "destructive",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800",
  },
  503: {
    code: 503,
    name: "Service Unavailable",
    title: "Layanan Tidak Tersedia",
    description: "Server sedang down, penuh, atau dalam pemeliharaan.",
    category: "Server Error (5xx)",
    solution: "Server saat ini sedang mengalami lonjakan beban kerja atau sedang dalam jadwal pemeliharaan rutin.",
    badgeVariant: "secondary",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
  504: {
    code: 504,
    name: "Gateway Timeout",
    title: "Gateway Kehabisan Waktu",
    description: "Server perantara tidak mendapat respons tepat waktu dari server tujuan.",
    category: "Server Error (5xx)",
    solution: "Server perantara kehabisan batas waktu tunggu saat mencoba menghubungi server aplikasi utama.",
    badgeVariant: "secondary",
    badgeClass: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700",
  },
};

export const HTTP_ERROR_LIST: HttpErrorDefinition[] = Object.values(HTTP_ERRORS);
