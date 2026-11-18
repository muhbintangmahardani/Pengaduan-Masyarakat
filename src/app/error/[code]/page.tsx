import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorView } from "@/components/common/ErrorView";
import { HTTP_ERRORS } from "@/lib/errorCodes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const numCode = parseInt(code, 10);
  const def = HTTP_ERRORS[numCode];

  return {
    title: def ? `Error ${def.code} - ${def.name} | jalanbaik` : "Error | jalanbaik",
    description: def?.description || "Halaman error jalanbaik",
  };
}

export default async function ErrorCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const numCode = parseInt(code, 10);

  if (isNaN(numCode) || !HTTP_ERRORS[numCode]) {
    notFound();
  }

  return <ErrorView code={numCode} />;
}
