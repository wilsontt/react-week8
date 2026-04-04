import { FaLeaf, FaChevronDown, FaChevronUp } from "react-icons/fa";
import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import img1 from "../../assets/succulent-guide-1.png";
import img2 from "../../assets/succulent-guide-2.png";
import img3 from "../../assets/succulent-sun-1.png";
import img4 from "../../assets/succulent-sun-2.png";
import img5 from "../../assets/succulent-air-1.png";
import img6 from "../../assets/succulent-air-2.png";
import img7 from "../../assets/succulent-water-1.png";
import img8 from "../../assets/succulent-water-2.png";
import styles from "./succulent.module.css";


export default function Succulent() {
  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <article className={styles.article}>
        <h1 className={styles.title}>
          <FaLeaf className="text-success" size={28} />
          認識多肉植物
        </h1>
        <p className={styles.intro}>
          想讀懂植物的語言嗎？了解植物何時需要喝水、照陽光嗎？那你來對地方了！
          這篇文章不只有基礎照顧教學，還希望讓你了解更深的照顧心法，把園藝種植基礎打好，
          看完後從此遠離黑手指的稱號，慢慢成為綠手指。
        </p>

        {/* 目錄（可收合）*/}
        {/* <nav className={styles.toc} aria-label="文章目錄">
          <div
            className={styles.tocTitle}
            onClick={() => setTocOpen((prev) => !prev)}
            onKeyDown={(e) => e.key === "Enter" && setTocOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            {tocOpen ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
            目錄
          </div>
          {tocOpen && (
            <ul className={styles.tocList}>
              <li>什麼是多肉植物？</li>
              <li>植物照顧的關鍵因素</li>
              <li>陽光 / 日照</li>
              <li>空氣 / 通風</li>
              <li>水 / 澆水</li>
            </ul>
          )}
        </nav> */}

        {/* 什麼是多肉植物 */}
        <section>
          <h4 className={styles.sectionTitle}>什麼是多肉植物？</h4>
          <h5 className={styles.subsectionTitle}>多肉植物大致上分為三大類：</h5>
          <ul className={styles.list}>
            <li className={styles.listItem}>蓮座型多肉植物，以景天科為主</li>
            <li className={styles.listItem}>柱型多肉植物，以仙人掌與大戟科為主</li>
            <li className={styles.listItem}>鳳梨科多肉植物，以空氣鳳梨與沙漠鳳梨為主</li>
          </ul>
          <div className={styles.imageRow}>
            <div className={styles.imageWrapper}>
              <img src={img1} alt="多肉植物示意圖 1" />
            </div>
            <div className={styles.imageWrapper}>
              <img src={img2} alt="多肉植物示意圖 2" />
            </div>
          </div>
          <p className={styles.paragraph}>
            因為多肉植物實際上是園藝界的用語，在定義上是模糊的，不是植物學上擁有明確定義的分類。
            最廣泛的定義是「擁有肥大儲水組織的植物」，最狹隘的定義是「必須行景天酸代謝光合作用的植物」，
            有時還會需要加入植物生長的環境、氣候去定義，像是生長在沙漠地區、乾燥地區、有明確乾季的氣候等等，
            所以簡單來說，就是植物上擁有肉質部的植物就是多肉植物。
          </p>
        </section>

        {/* 植物照顧的關鍵因素 */}
        <section>
          <h4 className={styles.sectionTitle}>植物照顧的關鍵因素與心法</h4>
          <blockquote className={styles.blockquote}>
            植物照顧的關鍵因素非常單純，就是我們耳熟能詳的：陽光、空氣、水，三原則。
          </blockquote>
          <p className={styles.paragraph}>
            植物照顧的心法呢，第一件是「了解自家種植環境的狀態」、第二件事是「了解植物喜歡的環境」；
            進階的兩件事，「了解自己願意為了植物改變環境與生活方式到什麼程度」、「了解植物對環境的接受彈性程度」。
            也可以說因地制宜，了解自己的環境並給予最合適的照顧方式。
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              陽光：多肉植物需要充足的陽光，才能進行光合作用，生長良好。
            </li>
            <li className={styles.listItem}>
              空氣：多肉植物需要良好的空氣流通，才能進行呼吸作用，生長良好。
            </li>
            <li className={styles.listItem}>
              水：多肉植物需要適量的水分，才能進行生長，生長良好。
            </li>
          </ul>
        </section>

        {/* 陽光 / 日照 */}
        <section>
          <h4 className={styles.sectionTitle}>陽光 / 日照</h4>
          <div className={styles.sectionImages}>
            <img src={img3} alt="多肉植物光照示意 1" />
            <img src={img4} alt="多肉植物光照示意 2" />
          </div>
          <p className={styles.paragraph}>
            多數的多肉植物都喜歡曬太陽，部分的多肉擁有耐陰的能力，光照充足可以讓多肉植物莖粗壯，
            葉片更加肥厚飽滿，適度的給他曬到太陽是很重要的。光照如果不足，可以改採多盆栽輪替的方法維持室內的綠意。
          </p>
        </section>

        {/* 空氣 / 通風 */}
        <section>
          <h4 className={styles.sectionTitle}>空氣 / 通風</h4>
          <div className={styles.sectionImages}>
            <img src={img5} alt="多肉植物通風示意 1" />
            <img src={img6} alt="多肉植物通風示意 2" />
          </div>
          <p className={styles.paragraph}>
            多數植物都喜歡通風的環境，因為植物生長在大自然之中的環境裡本身就是通風的居多，
            就算是熱帶雨林的高濕度環境，也是「維持高濕度的通風狀態」；而植物也透過葉片上的氣孔進行「呼吸作用」，
            如果葉片上有積灰塵也建議將它拭去，幫助植物進行交換二氧化碳與氧氣的流通。通風時也能加速盆土介質的乾燥，
            較不易造成爛根，不通風時植株生長會遲緩，且較易滋生病蟲害。
          </p>
        </section>

        {/* 水 / 澆水 */}
        <section>
          <h4 className={styles.sectionTitle}>水 / 澆水</h4>
          <div className={styles.sectionImages}>
            <img src={img7} alt="多肉植物澆水示意 1" />
            <img src={img8} alt="多肉植物澆水示意 2" />
          </div>
          <p className={styles.paragraph}>
            俗話說「澆水學三年」，實際上可能需要更久，澆水時機的掌握一直是新手在照顧植物上的難題。
            除了用眼觀察植株是否葉片低垂較沒精神、用手指頭伸入土表感受濕度外，還要注意：
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>澆水的時間：多肉植物建議傍晚澆水</li>
            <li className={styles.listItem}>水質：各地區自來水質不同，雨水較為中性適合所有植物</li>
            <li className={styles.listItem}>避免盆內積水：盆器底部若有排水孔會更容易管理</li>
          </ul>
        </section>
      </article>
    </PageWithLogoBg>
  );
}
