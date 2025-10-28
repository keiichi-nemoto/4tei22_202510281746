import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const tasks = [
  { category: "営業支援", value: 30, color: "#60a5fa" },
  { category: "サンプル手配", value: 20, color: "#34d399" },
  { category: "見積作成", value: 20, color: "#fbbf24" },
  { category: "英語報告システム入力", value: 15, color: "#f87171" },
  { category: "マルチタスク対応", value: 15, color: "#a78bfa" },
];

const plaudAIUsage = [
  { name: "会議文字起こし", time: 4 },
  { name: "商談・打合せ", time: 3 },
  { name: "議事録整理", time: 2 },
  { name: "その他", time: 1 },
];

export default function HenkelDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        ヘンケルジャパン面接内容（2025/10/28）ダッシュボード
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">面接概要</h2>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li><strong>日時：</strong>2025年10月28日（火）10:00〜10:38</li>
              <li><strong>方法：</strong>オンライン（自宅・Teams）</li>
              <li><strong>部署：</strong>車・エレクトロ事業部 営業支援</li>
              <li><strong>勤務地：</strong>磯子オフィス</li>
              <li><strong>共通言語：</strong>英語（ドイツ本社との連携）</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">求められるスキル・特徴</h2>
            <ul className="list-disc list-inside text-gray-700 text-sm">
              <li>訪問計画（Visit Plan）関連書類の作成サポート</li>
              <li>サンプル手配・見積書作成</li>
              <li>英語でのシステム入力・報告</li>
              <li>複数業務を柔軟に対応する能力</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">業務構成比（概算）</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasks}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.category}
                >
                  {tasks.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">plaud AI 利用時間配分（月10時間内）</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={plaudAIUsage}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis label={{ value: "時間 (h)", angle: -90, position: "insideLeft" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="time" name="使用時間（時間）" fill="#60a5fa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-10 rounded-2xl shadow-md">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">まとめ</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            本ポジションでは、営業支援に関する多岐にわたるタスクを遂行しながら、
            ドイツ本社との英語コミュニケーションを行う必要があります。業務の正確性とスピード、
            そして柔軟な対応力が重視されます。さらに、plaud AIを活用することで、会議記録・議事録作成を効率化し、
            限られた時間の中で最大の成果を出す運用が求められます。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
