const setGoalBtn = document.getElementById("setGoalBtn");
  const goalInput = document.getElementById("goalInput");
  const goalList = document.getElementById("goalList");

  setGoalBtn.addEventListener("click", function () {
    const goalText = goalInput.value.trim();

    if (goalText !== "") {
      const listItem = document.createElement("li");
      listItem.textContent = goalText;
      goalList.appendChild(listItem);

      // Clear input
      goalInput.value = "";
    } else {
      alert("Please enter a goal first.");
    }
  });