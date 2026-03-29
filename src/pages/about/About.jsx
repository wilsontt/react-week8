import { FaInfo, FaHeart, FaLeaf, FaEnvelope, FaMobile, FaPhone } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";


const About = () => {
  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <div className="w-100 text-center">
        <h2 className="text-center mb-2">
          <FaInfo className="text-warning me-2" size={32} />關於我們
        </h2>
        <hr className="mx-auto" style={{ maxWidth: '600px' }} />

        <div
          className="container mb-0"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.40)',
            borderRadius: '10px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
        <div className="row g-4">
          {/* 品牌介紹 */}
          <div className="col-12">
            <div className="card border-0"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            >
              <div className="card-body p-4">
                <h3 className="card-title mb-3">
                  <FaLeaf className="text-success me-2" />花草的世界
                </h3>
                <p className="card-text text-muted mb-0 text-center"
                  style={{
                    // backgroundColor: '#e9ecef',
                    borderRadius: '5px',
                    padding: '10px',
                  }}>
                  我們相信，花能為生活帶來溫度與美好。「花的世界」致力於提供多樣化的花卉與相關商品，
                  <br />從鮮花、盆花到花藝周邊，讓您無論送禮或妝點居家，都能找到最適合的選擇。
                  <br />我們重視品質與服務，希望每一位顧客都能在這裡遇見喜歡的花，帶回一份好心情。
                  <br />或是透過我們提供專業的團隊，為您打造一個舒適的居家空間，就像生活在大自然的環境中。
                </p>
              </div>
            </div>
          </div>

          {/* 我們的理念 */}
          <div className="col-12 col-md-6">
            <div className="card border-0 h-100" 
                  style={{ backgroundColor: 'rgba(248, 249, 250, 0.4)' }}
            >
              <div className="card-body p-4">
                <h5 className="card-title mb-3">
                  <FaHeart className="text-danger me-2" />我們的理念
                </h5>
                <p className="card-text text-muted small mb-0 text-center">
                  以花為媒介，傳遞心意與祝福。我們嚴選商品、注重包裝與配送品質，並提供清楚的產品說明與售後服務，讓您買得安心、送得放心。
                </p>
              </div>
            </div>
          </div>

          {/* 聯絡我們 */}
          <div className="col-12 col-md-6">
            <div className="card border-0 h-100" 
                  style={{ backgroundColor: 'rgba(248, 249, 250, 0.4)' }}
            >
              <div className="card-body p-4">
                <h5 className="card-title mb-3">
                  <FaPhone className="text-primary me-2" />聯絡我們
                </h5>
                <p className="card-text text-muted small mb-1 text-center">
                  若有任何問題或建議，歡迎來信。
                </p>
                <a href="mailto:wilson.tzo@gmail.com" className="card-link">
                  <p className="text-center">
                    <FaEnvelope className="text-primary me-2" size={20} />wilson.tzo@gmail.com</p>
                </a>
                  <p className="card-text text-muted small mb-1 text-center">
                  <FaMobile className="text-primary me-2" size={20} />0912-345-678
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageWithLogoBg>
  );
};

export default About;