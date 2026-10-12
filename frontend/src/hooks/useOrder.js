import { useCallback, useEffect, useState } from "react";
import { orderApi } from "../services/api";

// Loads one order (owned by the current user) for the success and details pages
const useOrder = (id) => {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const { order: data } = await orderApi.get(id);
      setOrder(data);
      setStatus("ready");
    } catch (error) {
      const code = error?.response?.status;
      setStatus(code === 404 || code === 400 ? "notfound" : "error");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { order, setOrder, status, reload: load };
};

export default useOrder;
