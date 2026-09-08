import { AlertCircle } from "lucide-react";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 border-2 border-red-500 bg-red-50 rounded px-3 py-2">
      <AlertCircle size={15} className="text-red-500 shrink-0" />
      
      <p className="text-sm text-red-600 font-medium">{message || "Error"}</p>
    </div>
  );
}
