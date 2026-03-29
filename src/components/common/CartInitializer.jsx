/**
 * 購物車初始化：App 掛載時取得購物車列表
 */
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "../../slices/cartSlice";

export default function CartInitializer() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  return null;
}
