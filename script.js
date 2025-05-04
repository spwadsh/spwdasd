const taskList = document.getElementById("taskList");
    const pointsDisplay = document.getElementById("points");
    const gachaDisplay = document.getElementById("gachaPoints");
    const resetTimer = document.getElementById("resetTimer");
    const rewardMessage = document.getElementById("rewardMessage");
    const progressBar = document.getElementById("progressBar");

    const tasks = [
      { name: "Học bài 1 tiếng", points: 100 },
      { name: "Giải bài tập toán", points: 200 },
      { name: "Xem video học tập", points: 150 },
      { name: "Thực hành lập trình", points: 250 },
      { name: "Đọc sách 30 phút", points: 100 },
      { name: "Tham gia thảo luận nhóm", points: 300 },
      { name: "Hoàn thành bài kiểm tra", points: 500 },
      { name: "Giúp bạn bè học bài", points: 200 },
      { name: "Thực hiện dự án nhỏ", points: 400 },
      { name: "Tham gia hoạt động ngoại khóa", points: 300 }
    ];

    let state = {
      points: 0,
      gacha: 0,
      completedTasks: 0,
      lastReset: 0,
      taskSubset: [],
      completedTaskFlags: [],
      lastLoginDate: "",
      taskHistory: [],
      gachaHistory: []
    };

    function saveState() {
      localStorage.setItem("learningApp", JSON.stringify(state));
    }

    function loadState() {
      const data = localStorage.getItem("learningApp");
      if (data) {
        state = JSON.parse(data);
      } else {
        state = {
          points: 0,
          gacha: 0,
          completedTasks: 0,
          lastReset: Date.now(),
          taskSubset: shuffleArray(tasks).slice(0, 5),
          completedTaskFlags: Array(5).fill(false),
          lastLoginDate: "",
          taskHistory: [],
          gachaHistory: []
        };
        saveState();
      }
      updateUI();  // ✅ Gọi duy nhất tại đây để vừa cập nhật điểm, vừa render nhiệm vụ
    }
    
    
    
    function updateUI() {
      pointsDisplay.textContent = state.points;
      gachaDisplay.textContent = state.gacha;
      progressBar.value = state.points;
      rewardMessage.textContent = state.points >= 1000 ? "🎉 Bạn đã đạt mốc 1000 điểm!" : "";
      updateResetTimer();
      createTasks(); // Cập nhật lại danh sách nhiệm vụ tại đây
    }
    
    
    

    function createTasks() {
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";
    
      state.taskSubset.forEach((task, i) => {
        const li = document.createElement("li");
        li.textContent = task.name;
    
        // Nếu đã hoàn thành thì không tạo nút
        if (state.completedTaskFlags[i]) {
          li.classList.add("completed");
        } else {
          const btn = document.createElement("button");
          btn.textContent = `✅ +${task.points}`;
          
          btn.addEventListener("click", () => {
            if (!state.completedTaskFlags[i]) {
              state.points += task.points;
              state.completedTaskFlags[i] = true;
              state.completedTasks++;
              
              saveState();
              updateUI(); // Gọi updateUI để làm mới giao diện
              playSound("task-complete.mp3"); // nếu có âm thanh
            }
          });
    
          li.appendChild(btn);
        }
    
        taskList.appendChild(li);
      });
    }
      function updateResetTimer() {
      const nextReset = state.lastReset + 3600000; // Cộng 1 giờ vào thời điểm reset cuối cùng
      const remaining = Math.max(0, nextReset - Date.now()); // Tính thời gian còn lại
      const minutes = String(Math.floor(remaining / 60000)).padStart(2, "0"); // Tính phút
      const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0"); // Tính giây
      resetTimer.textContent = `${minutes}:${seconds}`;
    
      // Nếu đã qua 1 giờ, reset lại nhiệm vụ và thời gian
      if (remaining <= 0) {
        state.lastReset = Date.now(); // Cập nhật lại thời gian reset
        state.taskSubset = shuffleArray(tasks).slice(0, 5);  // Lấy lại danh sách nhiệm vụ ngẫu nhiên
        state.completedTaskFlags = Array(5).fill(false);    // Đặt lại trạng thái hoàn thành
        saveState();
        createTasks();  // Tạo lại danh sách nhiệm vụ
        updateUI();
      }
      setTimeout(updateResetTimer, 1000); // Cập nhật lại mỗi giây
    }
    
    function saveState() {
      localStorage.setItem("learningApp", JSON.stringify(state));
    }
    

    document.getElementById("resetTasksBtn").onclick = () => {
      if (state.points >= 750) {
        state.points -= 750;
        state.taskSubset = shuffleArray(tasks).slice(0, 5);  // Chọn lại nhiệm vụ ngẫu nhiên
        state.completedTaskFlags = Array(5).fill(false);    // Đặt lại trạng thái hoàn thành
        createTasks();  // Tạo lại danh sách nhiệm vụ
        saveState();
        updateUI();
        playSound("reset.mp3");
        alert("🎉 Nhiệm vụ đã được reset!");
      } else {
        alert("⚠️ Bạn không đủ điểm để reset nhiệm vụ!");
      }
    };
    document.getElementById("dailyLoginBtn").onclick = () => {
      const today = new Date().toLocaleDateString();
      if (state.lastLoginDate !== today) {
        state.points += 300;
        state.lastLoginDate = today;
        saveState();
        updateUI();
        playSound("daily-login.mp3");
        alert("🎉 Bạn đã nhận điểm đăng nhập hàng ngày!");
      } else {
        alert("⚠️ Bạn đã đăng nhập hôm nay rồi!");
      }
    };
    document.getElementById("convert500ToGachaBtn").onclick = () => {
      if (state.points >= 500) {
        state.points -= 500;
        state.gacha += 250;
        saveState();
        updateUI();
        playSound("points-convert.mp3");
        alert("✅ Bạn đã đổi 500 điểm lấy 250 điểm Gacha!");
      } else {
        alert("⚠️ Bạn không đủ điểm để đổi!");
      }
    };
    document.getElementById("convertPointsBtn").onclick = () => {
      if (state.points >= 10) {
        state.points -= 10;
        state.gacha += 5;
        saveState();
        updateUI();
        playSound("points-convert.mp3");
        alert("✅ Bạn đã đổi 10 điểm lấy 5 điểm Gacha!");
      } else {
        alert("⚠️ Bạn không đủ điểm để đổi!");
      }
    };
    document.getElementById("gachaBtn").onclick = () => {
      if (state.gacha >= 250) { // Kiểm tra xem người dùng có đủ điểm không
        state.gacha -= 250;  // Trừ điểm khi quay
        //state.gacha++;  // Tăng số lần quay Gacha
        saveState();  // Lưu trạng thái
        updateUI();  // Cập nhật lại UI
    
        playSound("gacha-spin.mp3"); // Phát âm thanh quay Gacha (nếu có)
        alert("🎉 Bạn đã quay Gacha thành công!");
    
        // Mô phỏng phần thưởng ngẫu nhiên
        const rewards = ["50 điểm", "100 điểm", "150 điểm"];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        alert(`Phần thưởng: ${reward}`);
        
        // Cập nhật điểm sau khi quay
        if (reward === "50 điểm") {
          state.points += 50;
        } else if (reward === "100 điểm") {
          state.points += 100;
        } else if (reward === "150 điểm") {
          state.points += 150;
        }
    
        saveState();
        updateUI();
      } else {
        alert("⚠️ Bạn không đủ điểm để quay Gacha!");
      }
    };
    
    
    
    

    function playSound(filename) {
      const audio = new Audio(`sounds/${filename}`);
      audio.play();
    }

    function toggleDarkMode() {
      document.body.classList.toggle("dark-mode");
    }

    function shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    loadState();
    
    createTasks();
    updateUI();
    updateResetTimer();
