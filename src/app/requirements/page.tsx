import RequirementCard from "@/components/RequirementCard";
import { getRequirements } from "@/lib/data-provider";

export default function RequirementsPage() {
  const requirements = getRequirements();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">需求訪談紀錄</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          7 家合作組織的需求訪談彙整。前 3 家（腦麻協會、漸凍人協會、陽光基金會）是我接手時已上線的組織，紀錄的是
          2024/10 成果發表會期間的後續需求了解；後 4 家為我主導的完整需求訪談與導入流程。
        </p>
      </div>

      <div className="space-y-4">
        {requirements.map((log) => (
          <RequirementCard key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
