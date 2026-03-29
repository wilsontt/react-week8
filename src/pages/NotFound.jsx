import { FaHome } from 'react-icons/fa';
import { Link } from 'react-router';
import PageWithLogoBg from '../components/common/PageWithLogoBg';

import notFoundImage from '../assets/notFoundImage.png';

const NotFound = () => {
  return (
    <PageWithLogoBg className="container-fluid">
      <div className="container text-center" style={{ marginTop: '50px' }}>
        <h2>404 Page Not Found 找不到這個網頁</h2>
        <img src={notFoundImage}
             width="200"
             height="200"
             alt="404 Not Found"
             className="img-fluid mt-3 w-25" />
        <p>請檢查您的網址是否正確</p>
        <hr />
        <Link to="/" className="btn btn-primary btn-lg shadow-sm hover-effect">
          <FaHome className="me-2 text-white" size={24} />回首頁
        </Link>
      </div>
    </PageWithLogoBg>
  )
}

export default NotFound;