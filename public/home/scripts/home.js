import { API_BASE_URL, DATE_TIME_FORMAT, TIME_ZONE } from "./config.js";

let voteData = {}; // 將 voteData 改為物件

document.addEventListener("DOMContentLoaded", initializeVoteList);

async function initializeVoteList() {
  try {
    const [votesResponse, statusesResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/vote`),
      axios.get(`${API_BASE_URL}/vote/statuses`),
    ]);

    const votes = votesResponse.data.data.votes;
    const statuses = statusesResponse.data.data.statuses;

    // 合併投票數據和狀態
    votes.forEach((vote) => {
      const status = statuses.find((s) => s.id === vote.id)?.status || false;
      voteData[vote.id] = { ...vote, status };
    });

    updateVoteList();
  } catch (error) {
    console.error("初始化投票列表時發生錯誤:", error);
  }
}

function updateVoteList() {
  const voteList = document.getElementById("voteList");

  if (Object.keys(voteData).length === 0) {
    voteList.innerHTML =
      '<tr><td colspan="5" class="text-center">暫無投票</td></tr>';
  } else {
    voteList.innerHTML = Object.values(voteData)
      .map((vote, index) => createVoteRow(vote, index + 1))
      .join("");
  }
}

function createVoteRow(vote, index) {
  const statusClass = vote.status ? "text-success" : "text-danger";
  const statusIcon = vote.status ? "fa-play-circle" : "fa-stop-circle";
  const status = vote.status ? "進行中" : "未進行";

  return `
    <tr data-vote-id="${vote.id}">
      <td class="vote-information">${index}</td>  
      <td class="vote-information">${vote.title}</td>
      <td class="vote-information">${convertToLocalTime(
        vote.created_at,
        DATE_TIME_FORMAT,
        TIME_ZONE
      )}</td>
      <td class="vote-information vote-status ${statusClass}">
        <i class="fas ${statusIcon}"></i> <span class="font-weight-bold">${status}</span>
      </td>
      <td class="vote-information">
        <a href="../voting/voting.html?voteId=${
          vote.id
        }" class="btn btn-sm btn-info me-1">
          <i class="fas fa-eye"></i> 查看
        </a>
        <a href="../update-vote/update-vote.html?voteId=${
          vote.id
        }" class="btn btn-sm btn-warning me-1">
          <i class="fas fa-edit"></i> 修改
        </a>
        <button class="btn btn-sm btn-danger me-1 delete-vote-btn">
          <i class="fas fa-trash"></i> 刪除
        </button>
      </td>
    </tr>
    <tr class="vote-description" data-vote-id="${vote.id}">
      <td colspan="5">
        ${vote.description || "----- 無描述 -----"}
      </td>
    </tr>
  <!-- 測試用代碼開始 -->
  <tr class="vote-debug" data-vote-id="${vote.id}">
    <td colspan="5">
      <pre>${JSON.stringify(voteData[vote.id], null, 2)}</pre>
    </td>
  </tr>
  <!-- 測試用代碼結束 -->
  `;
}

export function updateVoteStatus(voteId, status) {
  const voteKey = String(voteId);
  if (!voteData.hasOwnProperty(voteKey)) return;

  voteData[voteKey].status = status;

  const statusCell = document.querySelector(
    `tr[data-vote-id="${voteId}"] td.vote-status`
  );
  if (!statusCell) return;

  const statusClass = status ? "text-success" : "text-danger";
  const statusIcon = status ? "fa-play-circle" : "fa-stop-circle";
  const statusText = status ? "進行中" : "未進行";

  statusCell.className = `vote-information vote-status ${statusClass}`;
  statusCell.innerHTML = `<i class="fas ${statusIcon}"></i> <span class="font-weight-bold">${statusText}</span>`;
}

// 時區轉換函數
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

function deleteVote(voteId) {
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
        // 從物件中移除對應的投票項目
        const voteKey = String(voteId);
        if (voteData.hasOwnProperty(voteKey)) {
          delete voteData[voteKey];
        }
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

document.getElementById("voteList").addEventListener("click", function (event) {
  if (event.target.closest(".delete-vote-btn")) {
    const button = event.target.closest(".delete-vote-btn");
    const voteId = button.closest("tr").dataset.voteId;
    deleteVote(voteId);
  }
});
