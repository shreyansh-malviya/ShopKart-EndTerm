import { useCallback, useEffect, useState } from "react";
import { PackageIcon } from "../components/Icons";
import OrderCard from "../components/OrderCard";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/StateViews";
import { orderApi } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  // GET /orders returns only this user's paid orders, newest first
  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { orders: list } = await orderApi.list();
      setOrders(list);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "loading") return <LoadingState message="Loading your orders..." />;
  if (status === "error") return <ErrorState title="Unable to load your orders." onRetry={load} />;

  return (
    <div>
      <PageHeader eyebrow="Order history" title="My Orders">
        {orders.length > 0 && (
          <p className="font-mono text-sm text-ink-soft">
            {orders.length} order{orders.length === 1 ? "" : "s"}
          </p>
        )}
      </PageHeader>

      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageIcon width={28} height={28} />}
          title="You have not placed any orders yet."
          message="When you do, they will show up here."
          actionLabel="Start Shopping"
          actionTo="/products"
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <OrderCard key={order._id} order={order} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
