import React from "react";
import { BarChart3, Bookmark, Send, Check } from "lucide-react";
import { InsightCard, BreakdownCard, TrendCard, BreakdownInline } from "./ConnectionSharedUI";

const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;
const toPairs = (record = {}, limit = 6) => Object.entries(record || {}).slice(0, limit);
const formatBucketLabel = (value = "") =>
    String(value)
        .replace(/^[a-z]+:/, "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const ConnectionDashboard = ({ analyticsData, adminAnalytics }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InsightCard label="Shown" value={analyticsData.counts?.shown || 0} icon={<BarChart3 size={16} />} />
                <InsightCard label="Saved" value={analyticsData.counts?.saved || 0} icon={<Bookmark size={16} />} />
                <InsightCard label="Interest Rate" value={formatPercent(analyticsData.conversion?.interestRate)} icon={<Send size={16} />} />
                <InsightCard label="Save Rate" value={formatPercent(analyticsData.conversion?.saveRate)} icon={<Check size={16} />} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <BreakdownCard title="Delivery Mix" items={toPairs(analyticsData.deliveryBreakdown)} formatter={formatBucketLabel} />
                <BreakdownCard title="Selection Mix" items={toPairs(analyticsData.selectionModeBreakdown)} formatter={formatBucketLabel} />
                <BreakdownCard title="Match Confidence" items={toPairs(analyticsData.confidenceBreakdown)} formatter={formatBucketLabel} />
                <BreakdownCard title="Profile Quality" items={toPairs(analyticsData.profileQualityBreakdown)} formatter={formatBucketLabel} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <TrendCard title="Your 14-Day Trend" trend={analyticsData.trend || []} />
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 space-y-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-neutral-400">Engine Snapshot</p>
                        <p className="text-sm text-neutral-300 mt-2">
                            {adminAnalytics.activeUsers || 0} active users out of {adminAnalytics.totalUsers || 0} total users
                        </p>
                        <p className="text-[12px] text-cyan-300/80 mt-1">Coverage {formatPercent(adminAnalytics.coverageRate)}</p>
                    </div>
                    <BreakdownInline label="Engine Selection Mix" items={toPairs(adminAnalytics.selectionModeBreakdown, 4)} formatter={formatBucketLabel} />
                    <BreakdownInline label="Engine Delivery Mix" items={toPairs(adminAnalytics.deliveryBreakdown, 4)} formatter={formatBucketLabel} />
                    <BreakdownInline label="Top Profile Types" items={toPairs(adminAnalytics.diversityBreakdown?.profileTypes, 4)} formatter={formatBucketLabel} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <BreakdownCard title="Top Clusters" items={toPairs(adminAnalytics.diversityBreakdown?.clusters)} formatter={formatBucketLabel} />
                <BreakdownCard title="Top Locations" items={toPairs(adminAnalytics.diversityBreakdown?.locations)} formatter={formatBucketLabel} />
            </div>
        </div>
    );
};

export default ConnectionDashboard;
