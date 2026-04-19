"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, Loader2, AlertCircle, Lock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReviewForm } from "@/components/transaction/ReviewForm";
import type { Category } from "@/app/generated/prisma/client";
import type { ExtractionResult } from "@/src/types";
import { getApiHeaders } from "@/src/lib/apiClient";
import { useDemoMode } from "@/src/lib/demoMode";

type Step = "capture" | "uploading" | "extracting" | "review" | "error";

export default function AddPage() {
  const router = useRouter();
  const isDemoMode = useDemoMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [receiptId, setReceiptId] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setStep("uploading");

    try {
      // 1. Upload
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: getApiHeaders(),
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Falha no upload da imagem");
      const { receiptId: rid, imageUrl: url } = await uploadRes.json();
      setReceiptId(rid);
      setImageUrl(url);

      // 2. Extração
      setStep("extracting");
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getApiHeaders() },
        body: JSON.stringify({ receiptId: rid }),
      });
      if (!extractRes.ok) {
        const { error: msg } = await extractRes.json();
        throw new Error(msg ?? "Falha na extração");
      }
      const { data } = await extractRes.json();

      // 3. Categorias
      const catRes = await fetch("/api/transactions?resource=categories", {
        headers: getApiHeaders(),
      });
      const cats: Category[] = await catRes.json();

      setExtraction(data);
      setCategories(cats);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      setStep("error");
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (isDemoMode) {
    return (
      <div>
        <PageHeader title="Adicionar gasto" />
        <div className="px-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-10 text-center">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Indisponível no modo demonstração
            </p>
            <p className="text-xs text-muted-foreground">
              Esta instância pública é somente leitura. Para testar a extração por IA,
              entre em contato.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "review" && extraction) {
    return (
      <div>
        <PageHeader title="Revisar gasto" />
        <ReviewForm
          receiptId={receiptId}
          imageUrl={imageUrl}
          extraction={extraction}
          categories={categories}
          onConfirm={() => router.push("/history")}
          onDiscard={() => {
            setStep("capture");
            setPreview(null);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Adicionar gasto" />
      <div className="px-4 space-y-4">
        {/* Preview */}
        {preview && (
          <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-muted">
            <Image src={preview} alt="Preview" fill className="object-contain" />
          </div>
        )}

        {/* Status de carregamento */}
        {(step === "uploading" || step === "extracting") && (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {step === "uploading" ? "Enviando imagem..." : "Extraindo dados com IA..."}
            </p>
          </div>
        )}

        {/* Erro */}
        {step === "error" && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="font-medium">Não foi possível extrair os dados</p>
              <p className="mt-0.5 text-xs opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Botões de captura */}
        {(step === "capture" || step === "error") && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleInputChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-6 w-6" />
              {step === "error" ? "Tentar outra imagem" : "Tirar foto do comprovante"}
            </button>

            <label className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
              <Upload className="h-5 w-5" />
              Selecionar arquivo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
      </div>
    </div>
  );
}
