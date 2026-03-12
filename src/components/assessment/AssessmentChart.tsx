import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { format } from "date-fns";
import { getBand, type AssessmentMeta } from "@/lib/assessment-questions";

interface DataPoint {
  total_score: number;
  created_at: string;
}

interface Props {
  data: DataPoint[];
  meta: AssessmentMeta;
}

const formatDate = (d: string) => format(new Date(d), "MMM d");

const CustomTooltip = memo(({ active, payload, meta, t }: any) => {
  if (!active || !payload?.length) return null;
  const score = payload[0].value as number;
  const band = getBand(meta, score);
  return (
    <div className="bg-card border border-border rounded-echo-md px-3 py-2 shadow-echo-1 text-sm">
      <p className="font-semibold text-bark">{score} / {meta.maxScore}</p>
      <p style={{ color: band.color }} className="font-medium">{t(band.labelKey)}</p>
    </div>
  );
});
CustomTooltip.displayName = "CustomTooltip";

const AssessmentChart = ({ data, meta }: Props) => {
  const { t } = useTranslation();

  const chartData = useMemo(
    () => data.map((d) => ({ date: formatDate(d.created_at), score: d.total_score, raw: d.created_at })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-driftwood text-center py-8">
        {t("assessment.noDataYet")}
      </p>
    );
  }

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--driftwood))" />
          <YAxis domain={[0, meta.maxScore]} tick={{ fontSize: 11 }} stroke="hsl(var(--driftwood))" />
          {meta.bands.slice(1).map((band) => (
            <ReferenceLine
              key={band.min}
              y={band.min}
              stroke={band.color}
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          ))}
          <Tooltip content={<CustomTooltip meta={meta} t={t} />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--forest))"
            strokeWidth={2}
            dot={{ r: 4, fill: "hsl(var(--forest))" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default memo(AssessmentChart);
