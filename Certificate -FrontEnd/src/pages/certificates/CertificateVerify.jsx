import React, { useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyCertificate } from "../../services/templateService";

export default function CertificateVerify() {
  const params = useParams();
  const [certificateNumber, setCertificateNumber] = useState(params.certificateNumber || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verify = async () => {
    if (!certificateNumber.trim()) {
      toast.error("Certificate number is required");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyCertificate(certificateNumber.trim());
      setResult(data || null);
      toast.success("Verification complete");
    } catch {
      setResult(null);
      toast.error("Certificate not found or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-xl font-semibold text-slate-900">Verify Certificate</h1>
      <div className="flex gap-2">
        <input
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
          placeholder="Enter certificate number"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={loading}
          onClick={verify}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </div>

      {result ? (
        <pre className="overflow-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
