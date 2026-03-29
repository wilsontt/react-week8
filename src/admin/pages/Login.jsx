import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import { showNotification } from "../../slices/notificationSlice";

import axios from "axios";


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
      console.error("登入失敗：", error);
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

  // 提交登入請求（API 驗證保留供未來使用）
  // const onLoginSubmit = async (formData) => {
  //   try {
  //     // 發送登入請求，並取得 token。
  //     const response = await axios.post(`${API_BASE}/admin/signin`, formData);
  //     const { token, expired } = response.data;
  //     // console.log('登入成功', response.data);

  //     // 設定 token 到 state，並設定登入狀態為 true，並跳轉到產品列表頁面。
  //     setLoginResult({ token, expired });
  //     setIsAuth(true);
  //     dispatch(login({ token, expired }));
  //     dispatch(createAsyncMessage({
  //       success: true,
  //       message: "登入成功",
  //     }))
  //     navigate("/admin/productListPage");

  //   } catch (error) {
  //     setIsAuth(false); // 登入失敗，設置登入狀態為 false
  //     console.error('登入失敗，錯誤訊息：', error);
  //     dispatch(createAsyncMessage({
  //       success: false,
  //       message: "登入失敗，請重新確認你的帳號、密碼是否正確。",
  //     }));
  //     // 使用 alert 顯示錯誤訊息
  //     // window.alert('登入失敗，請重新確認你的帳號、密碼是否正確。');
  //     // if (axios.isAxiosError(error) && error.response) {
  //     //   console.error('登入失敗，錯誤訊息：', error.response);
  //     // } else {
  //     //   console.error('登入失敗，錯誤訊息：', error);
  //     // }
  //   }
  // };




  // 儲存登入表單資料，使用 useState 儲存表單資料 
  // const [formData, setFormData] = useState({
  //     username: '',
  //     password: '',
  // });

  return (
    <PageWithLogoBg>
      {/* 登入表單 */}
      {/* <div className="container mt-5 mx-auto rounded-3" style={{ maxWidth: "28rem" }}> */}
        <h2 className="mb-3 font-weight-normal text-center">Please Login 請先登入</h2>
      <div className="container mt-5 mx-auto rounded-3 w-25">
        <form className="form-floating w-100 px-3" onSubmit={handleSubmit(onLoginSubmit)}>
          <div className="form-floating mb-2">
            <input
              type="email"
              className="form-control w-100 text-start"
              name="username"
              placeholder="name@example.com"
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
            <label htmlFor="username">Email address</label>
            {errors.username && <p className="text-danger">{errors.username.message}</p>}
          </div>
          <div className="form-floating mb-2">
            <input
              type="password"
              className="form-control w-100 text-start"
              name="password"
              placeholder="Password"
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
            <label htmlFor="password">Password</label>
            {errors.password && <p className="text-danger">{errors.password.message}</p>}
          </div>
          <button
            className="w-100 mb-3 btn btn-lg btn-primary"
            type="submit"
          >
            Login 登入
          </button>
        </form>
      </div>
    </PageWithLogoBg>
  );
}

export default Login;