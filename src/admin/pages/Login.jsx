import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import { showNotification } from "../../slices/notificationSlice";

import axios from "axios";
import "./login.css";


// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;




function Login({ setIsAuth }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 使用 React HookForm 來管理表單狀態和驗證
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",       // 設定表單驗證模式為 onChange，當表單欄位有變化時，才進行驗證
    defaultValues: {        // 設定預設值
      username: '',
      password: '',
    },
  });
  /** 提交登入（先不管驗證，登入成功後跳產品列表管理） */
  // const onLoginSubmit = () => {
  //   setIsAuth?.(true);
  //   navigate("/admin/Products");
  // };

  /** 提交登入請求（API 驗證），formData 來自 handleSubmit */
  async function onLoginSubmit(formData) {
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data ?? {};
      if (token) {
        setIsAuth?.(true);
        // eslint-disable-next-line -- 登入成功需寫入 cookie 與 axios header
        document.cookie = `hexToken=${encodeURIComponent(token)}; expires=${new Date(expired).toUTCString()}; path=/; SameSite=Lax`;
        // eslint-disable-next-line -- 登入成功需設定 Authorization
        axios.defaults.headers.common.Authorization = token;

        setLoginResult({ token, expired });
        dispatch(showNotification({ type: "success", message: "登入成功" }));
        navigate("/admin/Products");
      }
    } catch (error) {
      setIsAuth?.(false);
      const msg = error?.response?.data?.message ?? "登入失敗，請重新確認帳號密碼";
      dispatch(showNotification({ type: "error", message: msg }));
    }
  }
  
  // 登入成功後 將 Token 寫到 Cookie 中，並設定 axios 的 default headers，並設置 token。
  const [loginResult, setLoginResult] = useState(null);
  useEffect(() => {
    if (!loginResult) return;
    document.cookie = `hexToken=${encodeURIComponent(loginResult.token)}; expires=${new Date(loginResult.expired).toUTCString()}; path=/; SameSite=Lax`;
    axios.defaults.headers.common.Authorization = loginResult.token;
  }, [loginResult]);

  // 儲存登入表單資料，使用 useState 儲存表單資料 
  // const [formData, setFormData] = useState({
  //     username: '',
  //     password: '',
  // });

  return (
    <PageWithLogoBg className="px-2 px-sm-3">
      <div className="admin-login-shell mt-4 mt-md-5">
        <h2 className="mb-3 fw-normal text-center px-1">Please Login 請先登入</h2>
        <form className="w-100" onSubmit={handleSubmit(onLoginSubmit)}>
          <div className="form-floating mb-3">
            <input
              id="admin-login-username"
              type="email"
              className="form-control w-100 text-start"
              name="username"
              placeholder="name@example.com"
              autoComplete="email"
              // React Hook Form 表單驗證規則：設定表單欄位的驗證規則。
              {...register("username", {
                required: "請輸入 EMAIL",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "EMAIL 格式不正確",
                },
              })}
              title="請輸入 EMAIL 帳號"
            // value={formData.username}
            // onChange={(e) => handleInputChange(e)}
            // required
            // autoComplete="email"
            />
            <label htmlFor="admin-login-username">Email address</label>
            {errors.username && <p className="text-danger">{errors.username.message}</p>}
          </div>
          <div className="form-floating mb-3">
            <input
              id="admin-login-password"
              type="password"
              className="form-control w-100 text-start"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              // React Hook Form 表單驗證規則：設定表單欄位的驗證規則。
              {...register("password", {
                required: "請輸入密碼",
                minLength: {
                  value: 10,
                  message: "密碼長度至少 10 碼",
                },
              })}
              title="請輸入密碼"
            // value={formData.password}
            // onChange={(e) => handleInputChange(e)}
            // required
            // autoComplete="current-password"
            />
            <label htmlFor="admin-login-password">Password</label>
            {errors.password && <p className="text-danger">{errors.password.message}</p>}
          </div>
          <button className="w-100 btn btn-lg btn-primary" type="submit">
            Login 登入
          </button>
        </form>
      </div>
    </PageWithLogoBg>
  );
}

export default Login;