import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  CreditCard,
  MoreHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLocation } from "react-router";

const metrics = [
  {
    label: "Active students",
    value: "12,480",
    delta: "+8.4%",
    icon: Users,
  },
  {
    label: "Issued certificates",
    value: "3,240",
    delta: "+12.1%",
    icon: Award,
  },
  {
    label: "Monthly revenue",
    value: "$18,240",
    delta: "+6.7%",
    icon: CreditCard,
  },
  {
    label: "Completion rate",
    value: "94.2%",
    delta: "+2.3%",
    icon: TrendingUp,
  },
];

const routeMeta: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "A real-time summary of certificate operations and platform activity.",
  },
  "/dashboard/students": {
    title: "Students",
    description: "Monitor onboarding progress, completion rates, and student engagement.",
  },
  "/dashboard/certificates": {
    title: "Certificates",
    description: "Track certificate generation, validation, and recent issuance activity.",
  },
  "/dashboard/orders": {
    title: "Orders",
    description: "Review order volume, payment status, and fulfillment pipeline health.",
  },
  "/dashboard/settings": {
    title: "Settings",
    description: "Manage workspace defaults, delivery preferences, and dashboard controls.",
  },
};

const orders = [
  { id: "ORD-1024", name: "Ava Thompson", item: "Course Bundle", amount: "$220", status: "Paid" },
  { id: "ORD-1025", name: "Liam Chen", item: "Certificate Reissue", amount: "$40", status: "Pending" },
  { id: "ORD-1026", name: "Noah Wilson", item: "Institution Pack", amount: "$520", status: "Paid" },
  { id: "ORD-1027", name: "Emma Garcia", item: "Transcript Add-on", amount: "$65", status: "Review" },
];

function Dashboard() {
  const location = useLocation();
  const meta = routeMeta[location.pathname] ?? routeMeta["/dashboard"];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-slate-950 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Secure admin workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              {meta.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {meta.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl bg-slate-100 p-4 dark:bg-slate-900 sm:grid-cols-4">
            {[
              { label: "Templates", value: "18" },
              { label: "Pending", value: "42" },
              { label: "Verified", value: "1.2k" },
              { label: "Exports", value: "86" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.article
            key={metric.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="rounded-[24px] bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                <metric.icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5" />
                {metric.delta}
              </span>
            </div>
            <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
              {metric.value}
            </p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                Analytics snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Placeholder chart area for issued certificates and revenue trends.
              </p>
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
              aria-label="More analytics options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid h-[260px] grid-cols-12 items-end gap-2 rounded-[24px] bg-[#f5f5f5] p-5 dark:bg-slate-900">
            {[42, 58, 46, 72, 66, 81, 78, 88, 74, 69, 91, 84].map((height, index) => (
              <div key={height + index} className="flex h-full flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-2xl bg-slate-900 dark:bg-slate-100"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
            Progress by stream
          </h2>
          <div className="mt-6 space-y-5">
            {[
              { label: "Student onboarding", value: 84 },
              { label: "Certificate issuance", value: 71 },
              { label: "Order automation", value: 63 },
              { label: "Verification requests", value: 57 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {item.value}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-900">
                  <div
                    className="h-2 rounded-full bg-slate-900 dark:bg-slate-100"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white shadow-sm dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest transactions tied to certificate fulfillment.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-slate-500 dark:text-slate-400">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Student</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.name}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.item}</td>
                  <td className="px-6 py-4 text-slate-900 dark:text-slate-100">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        order.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : order.status === "Pending"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;