const API_BASE_URL = "http://localhost:3000"; // ! (記得修改) 後端基本路徑
const BASE_URL = "http://127.0.0.1:5500/public"; // ! (記得修改) 前端基本路徑
const DATE_TIME_FORMAT = "zh-TW"; // 時間顯示格式：YYYY/MM/DD HH:mm:ss
const TIME_ZONE = "Asia/Taipei"; // 時區
document.addEventListener("DOMContentLoaded", updateVoteList);

async function updateVoteList() {
  const voteList = document.getElementById("voteList");
  const votes = await fetchVotes();

  if (votes.length === 0) {
    voteList.innerHTML =
      '<tr><td colspan="5" class="text-center">暫無投票</td></tr>';
  } else {
    voteList.innerHTML = votes
      .map((vote, index) => createVoteRow(vote, index + 1))
      .join("");
  }
}

async function fetchVotes() {
  try {
    const response = await axios.get(`${API_BASE_URL}/vote`);
    if (response.data && response.data.success) {
      return response.data.data.votes;
    } else {
      throw new Error(response.data.message || "獲取投票列表失敗");
    }
  } catch (error) {
    console.error("獲取投票列表時發生錯誤:", error);
    return [];
  }
}

// ! 目前資料庫存的 UTC 時間還是錯的，還沒找到修正方法
function createVoteRow(vote, index) {
  return `
    <tr data-vote-id="${vote.id}">
      <td class="vote-information">${index}</td>  
      <td class="vote-information">${vote.title}</td>
      <td class="vote-information">${convertToLocalTime(
        vote.created_at,
        DATE_TIME_FORMAT,
        TIME_ZONE
      )}</td>
      <td class="vote-information">
        <a href="../voting/index.html?voteId=${
          vote.id
        }" class="btn btn-sm btn-info me-1">
          <i class="fas fa-eye"></i> 查看
        </a>
        <a href="../update-vote/update-vote.html?voteId=${
          vote.id
        }" class="btn btn-sm btn-warning me-1">
          <i class="fas fa-edit"></i> 修改
        </a>
        <button onclick="deleteVote(this)" class="btn btn-sm btn-danger">
          <i class="fas fa-trash"></i> 刪除
        </button>
      </td>
    </tr>
    <tr class="vote-description" data-vote-id="${vote.id}">
      <td colspan="4">
        ${vote.description || "----- 無描述 -----"}
      </td>
    </tr>
    <tr class="vote-json" data-vote-id="${vote.id}">
      <td colspan="4">
        <pre>
          ${JSON.stringify(vote, null, 2)}
        </pre>
      </td>
    </tr>
  `;
}

// 添加時區轉換函數
function convertToLocalTime(utcTimeString, dateTimeFormat, timeZone) {
  const date = new Date(utcTimeString);

  return new Intl.DateTimeFormat(dateTimeFormat, {
    timeZone: timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function deleteVote(button) {
  const voteId = button.closest("tr").dataset.voteId;
  if (!voteId) {
    console.error("無法找到投票ID");
    return;
  }

  axios
    .delete(`${API_BASE_URL}/vote/${voteId}`)
    .then((response) => {
      const data = response.data;
      if (data.success) {
        alert("投票刪除成功");
        updateVoteList();
      } else {
        alert(`刪除失敗: ${data.error.message}`);
      }
    })
    .catch((error) => {
      console.error("刪除投票時發生錯誤:", error);
      alert("刪除投票時發生錯誤");
    });
}

// ! 測試用 HTML，顯示前端收到的 JSON 資料
{
  /* <tr>
  <td colspan="5">
    <pre>
      $
      {JSON.stringify(
        { ...vote, created_at: convertToLocalTime(vote.created_at) },
        null,
        2
      )}
    </pre>
  </td>
</tr>; */
}