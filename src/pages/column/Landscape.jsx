import PageWithLogoBg from "../../components/common/PageWithLogoBg";
import { FaLeaf } from "react-icons/fa";

import styles from "./succulent.module.css";
import img1 from "../../assets/landscape-1.png";
import img2 from "../../assets/landscape-2.png";
import img3 from "../../assets/landscape-3.png";
import img4 from "../../assets/landscape-4.png";


export default function Landscape() {

  return (
    <PageWithLogoBg className="container-fluid" alignTop>
      <article className={styles.article}>
        <h1 className={styles.title}>
          <FaLeaf className="text-success" size={28} />
          多肉與花卉佈置造景
        </h1>
        <p className={styles.intro}>
          拉近身心與大自然的距離，透過造景專業的設計，打造商業空間、居家生活環境，
          從環境評估、植物遴選到修剪種植，提供所有必要的介質與盆器，
          依客戶需求全面客製，以專業技術將自然與空間融合，打造專屬景觀。
        </p>

        {/* 空間造景介紹 */}
        <section>
          <h4 className={styles.sectionTitle}>空間造景、居家環境綠化</h4>
          <p>
            居家與商業空間佈置相較之下，設計更著重於彰顯個人品味與生活質感的提升。
            多肉與花卉佈置團隊在居家綠化的任務，是為空間的主人營造一片永續的專屬風景；
            從事前規劃到完工，在所有標準流程中的各階段，都藏著專人對細節的堅持：
            親自勘景、即時討論、模擬圖呈現、專業施工到後續維護，
            旨在賦予空間一番新氣象，為空間使用者帶來長久相伴的舒適感。
          </p>
          <div className={styles.imageRow}>
            <div className={styles.imageWrapper}>
              <img src={img1} alt="空間造景 1" />
            </div>
            <div className={styles.imageWrapper}>
              <img src={img2} alt="空間造景 2" />
            </div>
          </div>
          <p className={styles.paragraph}>
            無論是為裝潢增加佈置，或因應節日舉辦特別活動，在商業空間內融入植栽設計，能提升整體視覺豐富度，
            將自然之美引入空間，為使用空間的人們提供一個能夠擁抱自然之處。有肉造景團隊協助企業綠化空間，
            設需求為目標，以植物為媒介，搭配多元素材，創造出各種符合主題氣氛、令人印象深刻的效果。
            團隊擁有多年經驗協助舉辦品牌記者會、發表會、展覽、婚禮、貴賓活動、開幕、慶生等佈置，
            全客製規劃設計，清楚展現品牌形象，滿足不同規模及風格的空間需求。
          </p>
        </section>

        {/* 造景規劃 */}
        <section>
          <h4 className={styles.sectionTitle}>造景規劃</h4>
          <blockquote className={styles.blockquote}>
            一個結合美學、生態與功能的綜合工程，核心在於根據環境條件（光照、通風、排水）
            選擇合適植物，並配置石材、燈光與步道，創造出兼具視覺與生活享受的綠化空間。
          </blockquote>
          <p className={styles.paragraph}>
            植物照顧的心法呢，第一件是「了解自家種植環境的狀態」、第二件事是「了解植物喜歡的環境」；
            進階的兩件事，「了解自己願意為了植物改變環境與生活方式到什麼程度」、「了解植物對環境的接受彈性程度」。
            也可以說因地制宜，了解自己的環境並給予最合適的照顧方式。
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              環境評估 (場勘)： 記錄日照方位、風向、排水情況、既有植栽狀況與尺寸。
            </li>
            <li className={styles.listItem}>
              確立需求與風格： 決定是用來休憩、遮蔽鄰地視線（隱私）、種植食用香草，還是打造生態景觀。
              風格可選擇日式（石、水、枯山水）、現代簡約或自然雜木林風。
            </li>
            <li className={styles.listItem}>
              植物配置技術：
              <ul className={styles.list}>
                <li className={styles.listItem}>層次感： 利用喬木（主景）、灌木（分隔）、地被（覆蓋）創造空間立體感。</li>
                <li className={styles.listItem}>季節變化： 選擇不同季節開花或變葉的植物，維持四季景觀。</li>
                <li className={styles.listItem}>適地適種： 陽台適合耐陰耐旱植物（如虎尾蘭、蕨類），庭院則可選擇高大喬木。</li>
              </ul>
            </li>
            <li className={styles.listItem}>
              硬體與硬景觀：步道、圍籬、平台、座椅、燈光、雕塑等。
              石材選擇自然形式，植物與石頭通常遵循「三五成群，錯落有致」原則。
            </li>
          </ul>
        </section>

        <div className={styles.imageRow}>
          <div className={styles.imageWrapper}>
            <img src={img3} alt="空間造景 3" />
          </div>
          <div className={styles.imageWrapper}>
            <img src={img4} alt="空間造景 4" />
          </div>
        </div>

      </article>
    </PageWithLogoBg>
  )
}