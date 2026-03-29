/* 
分頁元件：用於分頁顯示，包含上一頁、下一頁、跳頁、總頁數、當前頁數、總筆數等。
傳入參數：pagination、onChangePage：分頁變更事件處理函數
*/

function Pagination({ pagination, onChangePage}) {

    const handlePageClick = (e, page) => {
        e.preventDefault();
        if (page >= 1 && page <= (pagination.total_pages || 1)) {
            onChangePage(page);
        }
    };

    return (
        <nav aria-label="分頁導覽">
            {/* 測試用：顯示分頁資料 */}
            {/* {JSON.stringify(pagination)} */}

            <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.has_pre ? '' : 'disabled'}`}>
                    <a className="page-link" href="#" aria-label="Previous"
                        onClick={(e) => handlePageClick(e, pagination.current_page - 1)}>
                        <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>
                {/* 從API取得總頁數，利用Array.from() 生成頁頁列表。*/}
                {
                    Array.from({length: pagination.total_pages}, (_, index) => {
                        const pageNum = index + 1;
                        const isCurrent = pagination.current_page === pageNum;
                        return (
                            <li className={`page-item ${isCurrent ? 'active disabled' : ''}`}
                                key={`${index}_page`}>
                                {isCurrent ? (
                                    <span className="page-link" aria-current="page">{pageNum}</span>
                                ) : (
                                    <a className="page-link" href="#"
                                        onClick={(e) => handlePageClick(e, pageNum)}>
                                        {pageNum}
                                    </a>
                                )}
                            </li>
                        );
                    })
                }
                <li className={`page-item ${!pagination.has_next && 'disabled'}`}>
                    <a className="page-link" href="#" aria-label="Next"
                        onClick={(e) => handlePageClick(e, pagination.current_page + 1)}>
                        <span aria-hidden="true">&raquo;</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default Pagination;