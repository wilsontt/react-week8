/**
 * 結帳流程主元件
 * 整合 Stepper 與各步驟內容，顯示於購物車下方
 */
import { useSelector } from "react-redux";
import CheckoutStepper from "./CheckoutStepper";
import CheckoutStep1 from "./CheckoutStep1";
import CheckoutForm from "./CheckoutForm";
import CheckoutPayment from "./CheckoutPayment";
import CheckoutSuccess from "./CheckoutSuccess";

export default function CheckoutFlow() {
  const { step, loading, error } = useSelector((s) => s.checkout);

  return (
    <div className="border-top pt-4 mt-4">
      <CheckoutStepper currentStep={step} />
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {step === 1 && <CheckoutStep1 />}
      {step === 2 && <CheckoutForm />}
      {step === 3 && <CheckoutPayment />}
      {step === 4 && <CheckoutSuccess />}
      {loading && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded"
          style={{ width: 100, height: 100, zIndex: 1050 }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中</span>
          </div>
        </div>
      )}
    </div>
  );
}
