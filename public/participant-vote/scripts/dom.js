// 處理 DOM 操作
import { submitVote } from "./websocket.js";

export function renderVoteDisplay(vote) {
  renderVoteInfo(vote);
  renderOptions(vote);
}

function renderVoteInfo(vote) {
  document.getElementById("voteTitle").textContent = vote.title;
  document.getElementById("voteDescription").textContent = vote.description;
  document.getElementById(
    "totalVotes"
  ).textContent = `總票數: ${vote.totalVotes}`;
}

function renderOptions(vote) {
  const voteId = vote.id;
  const options = vote.options;
  const optionsContainer = document.getElementById("voteOptions");
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    optionsContainer.appendChild(createOptionElement(voteId, option));
  });
}

function createOptionElement(voteId, option) {
  const optionElement = document.createElement("div");
  optionElement.className = "col-12 px-1";
  optionElement.id = `option-${option.id}`;

  optionElement.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">${option.name}</h5>
        <div class="d-flex align-items-center mb-2">
          <div class="progress flex-grow-1 mr-2">
            <div 
              class="progress-bar" 
              role="progressbar" 
              style="width: ${option.percentage}">
              ${option.votes} 票
            </div>
          </div>
          <span class="text-muted">${option.percentage}</span>
        </div>
      </div>
    </div>
  `;

  const voteButton = createVoteButton(voteId, option.id);
  optionElement.querySelector(".card-body").appendChild(voteButton);

  return optionElement;
}

function createVoteButton(voteId, optionId) {
  const voteButton = document.createElement("button");
  voteButton.className = "btn btn-primary btn-circle btn-sm";
  voteButton.textContent = "投票";
  const voterName = getVoterName();
  voteButton.onclick = () => submitVote(voteId, optionId, voterName);
  return voteButton;
}

export function getVoterName() {
  const name = localStorage.getItem("voterName");
  if (!name) {
    throw new Error("未提供參與者名稱");
  }
  return name;
}

export function renderVoteCounts(vote) {
  document.getElementById(
    "totalVotes"
  ).textContent = `總票數: ${vote.totalVotes}`;
  vote.options.forEach((option) => {
    const optionElement = document.getElementById(`option-${option.id}`);
    if (optionElement) {
      // 更新進度條
      const progressContainer = optionElement.querySelector(".d-flex");
      if (progressContainer) {
        progressContainer.innerHTML = `
          <div class="progress flex-grow-1 mr-2">
            <div 
              class="progress-bar" 
              role="progressbar" 
              style="width: ${option.percentage}">
              ${option.votes} 票
            </div>
          </div>
          <span class="text-muted">${option.percentage}</span>
        `;
      }

      let voteButton = optionElement.querySelector("button");
      if (!voteButton) {
        voteButton = createVoteButton(vote.id, option.id);
        optionElement.querySelector(".card-body").appendChild(voteButton);
      }
    }
  });
}
