import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import {
  DollarSign,
  ShoppingCart,
  Users,
  Receipt,
  TrendingUp,
} from "lucide-react";

import {
  getDashboardSummary,
  getOrders,
  getReports,
} from "../services/api";

const COLORS = ["#ff7a00", "#2563eb", "#16a34a", "#ef4444"];

function Dashboard() {
  const [summary, setSummary] = useState({
    revenue: 0,
    orders: 0,
    avgTicket: 0,
    occupancy: 0,
    topSelling: [],
  });

  const [orders, setOrders] = useState([]);

  const [report, setReport] = useState({
    todaySales: 0,
    weeklySales: 0,
    growth: 0,
    topCategory: "-",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboard, orderList, sales] = await Promise.all([
          getDashboardSummary(),
          getOrders(),
          getReports(),
        ]);

        setSummary(dashboard || {});
        setOrders(orderList || []);
        setReport(sales || {});
      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, []);

  // Temporary graph data (replace later with backend data)
  const revenueData = [
    { day: "Mon", revenue: 12000 },
    { day: "Tue", revenue: 15000 },
    { day: "Wed", revenue: 18000 },
    { day: "Thu", revenue: 16000 },
    { day: "Fri", revenue: 25000 },
    { day: "Sat", revenue: 32000 },
    { day: "Sun", revenue: 28000 },
  ];

  const orderStatus = [
    { name: "Completed", value: 62 },
    { name: "Preparing", value: 18 },
    { name: "Pending", value: 12 },
    { name: "Cancelled", value: 8 },
  ];

  const topItems = [
    { item: "Paneer Tikka", qty: 85 },
    { item: "Pizza", qty: 72 },
    { item: "Burger", qty: 60 },
    { item: "Pasta", qty: 42 },
    { item: "Cold Coffee", qty: 30 },
  ];

  const cards = [
    {
      title: "Revenue",
      value: `₹${summary.revenue.toLocaleString("en-IN")}`,
      icon: <DollarSign size={24} />,
      color: "#16a34a",
    },
    {
      title: "Orders",
      value: summary.orders,
      icon: <ShoppingCart size={24} />,
      color: "#2563eb",
    },
    {
      title: "Average Bill",
      value: `₹${summary.avgTicket}`,
      icon: <Receipt size={24} />,
      color: "#ff7a00",
    },
    {
      title: "Occupancy",
      value: `${summary.occupancy}%`,
      icon: <Users size={24} />,
      color: "#7c3aed",
    },
  ];

  return (
    <div style={{ padding: 24, color: "var(--text-main)", background: "var(--bg-dark)", minHeight: "100%" }}>
      <h1 style={{ marginBottom: 5 }}>Restaurant Dashboard</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Live overview of sales, orders and restaurant performance.
      </p>

      {/* KPI Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginTop: 25,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "var(--bg-card)",
              borderRadius: 18,
              padding: 20,
              border: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ color: "#94a3b8", fontSize: 13 }}>{card.title}</div>
                <h2 style={{ margin: "8px 0" }}>{card.value}</h2>
              </div>

              <div
                style={{
                  background: card.color + "22",
                  padding: 12,
                  borderRadius: 12,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
            </div>

            <div
              style={{
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 12,
                fontSize: 13,
              }}
            >
              <TrendingUp size={16} />
              +{report.growth}% this week
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginTop: 28,
        }}
      >
        {/* Revenue */}

        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 18,
            padding: 20,
            border: "1px solid var(--border-color)",
          }}
        >
          <h3>Revenue Trend</h3>

          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            This graph shows daily restaurant revenue for the last seven days.
            The X-axis represents days, while the Y-axis represents revenue in rupees.
          </p>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip />
              <Legend />
              <Line
                dataKey="revenue"
                stroke="#ff7a00"
                strokeWidth={3}
                name="Revenue (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}

        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: 18,
            padding: 20,
            border: "1px solid var(--border-color)",
          }}
        >
          <h3>Order Status</h3>

          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Displays the percentage of orders that are completed, preparing,
            pending, or cancelled.
          </p>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orderStatus} dataKey="value" outerRadius={85} label>
                {orderStatus.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar */}

      <div
        style={{
          background: "#1e293b",
          borderRadius: 18,
          padding: 20,
          marginTop: 24,
        }}
      >
        <h3>Top Selling Menu Items</h3>

        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          This chart compares the number of times each menu item was sold.
          Higher bars indicate more customer demand.
        </p>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topItems}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis dataKey="item" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="qty" fill="#ff7a00" name="Items Sold" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}

      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 18,
          padding: 20,
          marginTop: 24,
          border: "1px solid var(--border-color)",
        }}
      >
        <h3>Recent Orders</h3>

        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          Shows the latest customer orders with table number, status and bill amount.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ color: "var(--text-muted)" }}>
              <th align="left">Order ID</th>
              <th align="left">Table</th>
              <th align="left">Status</th>
              <th align="right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {orders.slice(0, 5).map((order) => (
              <tr key={order.id} style={{ borderTop: "1px solid var(--border-color)" }}>
                <td style={{ padding: "12px 0" }}>{order.id}</td>
                <td>{order.table}</td>
                <td>{order.status}</td>
                <td align="right">₹{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 18, border: "1px solid var(--border-color)" }}>
          <h4>Today's Sales</h4>
          <h2>₹{report.todaySales?.toLocaleString("en-IN")}</h2>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 18, border: "1px solid var(--border-color)" }}>
          <h4>Weekly Sales</h4>
          <h2>₹{report.weeklySales?.toLocaleString("en-IN")}</h2>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 18, border: "1px solid var(--border-color)" }}>
          <h4>Top Category</h4>
          <h2>{report.topCategory}</h2>
        </div>

        <div style={{ background: "var(--bg-card)", borderRadius: 18, padding: 18, border: "1px solid var(--border-color)" }}>
          <h4>Trending Items</h4>
          <h2>{summary.topSelling?.join(", ") || "-"}</h2>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;