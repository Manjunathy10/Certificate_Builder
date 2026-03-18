import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

/* ─── Stat Cards ─── */
const stats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Orders",
    value: "2,350",
    change: "+12.5%",
    trend: "up" as const,
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    value: "12,234",
    change: "+8.2%",
    trend: "up" as const,
    icon: Users,
  },
  {
    title: "Growth",
    value: "24.5%",
    change: "-2.1%",
    trend: "down" as const,
    icon: TrendingUp,
  },
];

/* ─── Recent Orders (table data) ─── */
const recentOrders = [
  { id: "#3210", customer: "Olivia Martin", status: "Completed", amount: "$342.00", date: "Feb 12" },
  { id: "#3209", customer: "Jackson Lee", status: "Processing", amount: "$128.00", date: "Feb 11" },
  { id: "#3208", customer: "Isabella Nguyen", status: "Completed", amount: "$574.00", date: "Feb 10" },
  { id: "#3207", customer: "William Kim", status: "Pending", amount: "$89.00", date: "Feb 09" },
  { id: "#3206", customer: "Sofia Davis", status: "Completed", amount: "$412.00", date: "Feb 08" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
  Processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.trend === "up"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ─── Charts Placeholder + Table ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart placeholder — spans 2 cols on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Revenue Overview
            </h2>
            <button
              className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {/* Chart placeholder bars */}
          <div className="flex items-end gap-3 h-52">
            {[40, 65, 50, 80, 55, 90, 70, 85, 60, 75, 95, 68].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-indigo-500/80 dark:bg-indigo-400/60 transition-all duration-500"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-gray-400">
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Side card — top products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5">
            Top Products
          </h2>
          <ul className="space-y-4">
            {[
              { name: "Premium Template", sales: 1234, pct: 82 },
              { name: "Dashboard Kit", sales: 986, pct: 65 },
              { name: "Icon Pack Pro", sales: 752, pct: 50 },
              { name: "UI Components", sales: 634, pct: 42 },
            ].map((p) => (
              <li key={p.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{p.sales}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-700"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* ─── Recent Orders Table ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Orders
          </h2>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {order.id}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{order.customer}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColor[order.status] ?? ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-900 dark:text-gray-100">
                    {order.amount}
                  </td>
                  <td className="px-6 py-3 text-right text-gray-500 dark:text-gray-400">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
