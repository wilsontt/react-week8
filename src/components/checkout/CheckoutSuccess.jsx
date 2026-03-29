/**
 * 結帳步驟 4：完成訂單
 */
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaCheckCircle } from "react-icons/fa";
import { resetCheckout } from "../../slices/checkoutSlice";
import { fetchCart } from "../../slices/cartSlice";

export default function CheckoutSuccess() {
  const dispatch = useDispatch();
  const { orderInfo } = useSelector((s) => s.checkout);

  const orderId = orderInfo?.id ?? orderInfo?.orderId ?? "—";

  /** 結帳完成後同步購物車（後端建立訂單時會清空購物車） */
  const handleNavigate = () => {
    dispatch(resetCheckout());
    dispatch(fetchCart());
  };

  return (
    <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
      <div className="card-body text-center py-5">
        <FaCheckCircle className="text-success mb-3" size={64} />
        <h4 className="fw-bold mb-2">付款完成</h4>
        <p className="text-muted small mb-2">您的訂單編號：{orderId}</p>
        <p className="text-muted small mb-4">
          感謝您的支持，後續會盡快連絡您，為您實現暢遊您所購買的景點～
        </p>
        <div className="d-flex gap-2 justify-content-center">
          <Link to="/productList" className="btn btn-outline-secondary" onClick={handleNavigate}>
            繼續選購
          </Link>
          <Link to="/" className="btn btn-warning text-white" onClick={handleNavigate}>
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
