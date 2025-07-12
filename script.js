document.addEventListener('DOMContentLoaded', () => {
    // 状态变量
    let isRunning = false;
    let isBreak = false;
    let workTime = 25 * 60; // 25分钟（秒）
    let breakTime = 5 * 60;  // 5分钟（秒）
    let timeLeft = workTime;
    let timerId = null;
    let tomatoCount = 0;
    let focusTime = 0;
    let cyclesCount = 0;
    
    // 待办事项数据
    let tasks = [];
    let currentFilter = 'all';
    
    // DOM元素
    const timerElement = document.getElementById('timer');
    const statusElement = document.getElementById('status');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    const resetButton = document.getElementById('reset-btn');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const progressCircle = document.getElementById('progress-circle');
    const tomatoCountElement = document.getElementById('tomato-count');
    const focusTimeElement = document.getElementById('focus-time');
    const cyclesCountElement = document.getElementById('cycles-count');
    const modeStatusDot = document.getElementById('mode-status-dot');
    const modeStatusText = document.getElementById('mode-status-text');
    
    // 待办事项DOM元素
    const tasksContainer = document.getElementById('tasks-container');
    const newTaskInput = document.getElementById('new-task');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskCountElement = document.getElementById('task-count');
    const completedCountElement = document.getElementById('completed-count');
    const totalCountElement = document.getElementById('total-count');
    const todayTasksElement = document.getElementById('today-tasks');
    const completedTasksElement = document.getElementById('completed-tasks');
    const priorityTasksElement = document.getElementById('priority-tasks');
    const emptyStateElement = document.getElementById('empty-state');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // 初始化进度环
    const updateProgressRing = () => {
        const totalTime = isBreak ? breakTime : workTime;
        const progress = ((totalTime - timeLeft) / totalTime) * 264;
        progressCircle.style.strokeDashoffset = 264 - progress;
        
        // 根据状态改变颜色
        progressCircle.classList.remove('stroke-primary-500', 'stroke-green-500');
        progressCircle.classList.add(isBreak ? 'stroke-green-500' : 'stroke-primary-500');
    };
    
    // 格式化时间
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    // 更新计时器显示
    const updateTimerDisplay = () => {
        timerElement.textContent = formatTime(timeLeft);
        updateProgressRing();
    };

    // 更新右上角模式状态
    const updateModeStatus = (breakActive) => {
        if (breakActive) {
            modeStatusDot.classList.remove('bg-red-500');
            modeStatusDot.classList.add('bg-green-500');
            modeStatusText.textContent = '休息中';
        } else {
            modeStatusDot.classList.remove('bg-green-500');
            modeStatusDot.classList.add('bg-red-500');
            modeStatusText.textContent = '专注中';
        }
    };
    
    // 开始计时
    const startTimer = () => {
        if (isRunning) return;
        
        isRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        startButton.classList.add('opacity-70');
        pauseButton.classList.remove('opacity-70');
        
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                
                // 播放提示音
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                audio.play();
                
                if (!isBreak) {
                    // 完成一个番茄钟
                    tomatoCount++;
                    tomatoCountElement.textContent = tomatoCount;
                    focusTime += parseInt(workTimeInput.value);
                    focusTimeElement.textContent = focusTime;
                    
                    // 每4个番茄钟后休息更长时间
                    if (tomatoCount % 4 === 0) {
                        breakTime = 15 * 60;
                        breakTimeInput.value = 15;
                        statusElement.textContent = '完成4个番茄钟！休息15分钟';
                    } else {
                        statusElement.textContent = '专注完成！开始休息';
                    }
                    
                    isBreak = true;
                    timeLeft = breakTime;
                    updateModeStatus(true);
                } else {
                    // 休息结束
                    cyclesCount++;
                    cyclesCountElement.textContent = cyclesCount;
                    statusElement.textContent = '休息结束！开始新的专注';
                    isBreak = false;
                    timeLeft = workTime;
                    updateModeStatus(false);
                }
                
                updateTimerDisplay();
                startButton.disabled = false;
                startButton.classList.remove('opacity-70');
            }
        }, 1000);
    };
    
    // 暂停计时
    const pauseTimer = () => {
        if (!isRunning) return;
        
        clearInterval(timerId);
        isRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        startButton.classList.remove('opacity-70');
        pauseButton.classList.add('opacity-70');
        statusElement.textContent = isBreak ? '休息已暂停' : '专注已暂停';
    };
    
    // 重置计时器
    const resetTimer = () => {
        clearInterval(timerId);
        isRunning = false;
        isBreak = false;
        timeLeft = workTime;
        
        startButton.disabled = false;
        pauseButton.disabled = true;
        startButton.classList.remove('opacity-70');
        pauseButton.classList.add('opacity-70');
        
        statusElement.textContent = '准备开始专注';
        updateTimerDisplay();
        updateModeStatus(false);
    };
    
    // 更新时间设置
    const updateTimeSettings = () => {
        workTime = parseInt(workTimeInput.value) * 60;
        breakTime = parseInt(breakTimeInput.value) * 60;
        
        if (!isRunning && !isBreak) {
            timeLeft = workTime;
            updateTimerDisplay();
        }
    };
    
    // 待办事项功能
    
    // 从API获取任务
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            tasks = await response.json();
            renderTasks();
            updateTaskStats();
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    };

    // 保存任务到API
    const saveTasks = async () => {
        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tasks),
            });
            updateTaskStats();
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    };
    
    // 更新任务统计信息
    const updateTaskStats = () => {
        const today = new Date().toISOString().split('T')[0];
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const todayTasks = tasks.filter(task => task.dateAdded === today).length;
        const priorityTasks = tasks.filter(task => task.priority).length;
        
        taskCountElement.textContent = totalTasks;
        completedCountElement.textContent = completedTasks;
        totalCountElement.textContent = totalTasks;
        todayTasksElement.textContent = todayTasks;
        completedTasksElement.textContent = completedTasks;
        priorityTasksElement.textContent = priorityTasks;
        
        // 显示/隐藏空状态
        emptyStateElement.style.display = totalTasks ? 'none' : 'block';
    };
    
    // 渲染任务列表
    const renderTasks = () => {
        tasksContainer.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-center py-12 text-gray-400';
            emptyMessage.innerHTML = `
                <i class="fas fa-inbox text-4xl mb-4"></i>
                <p>没有找到任务</p>
            `;
            tasksContainer.appendChild(emptyMessage);
            return;
        }
        
        filteredTasks.forEach((task) => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item p-4 flex items-center ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            taskElement.innerHTML = `
                <div class="w-10 flex justify-center">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}
                        class="complete-checkbox w-5 h-5 rounded-full border-2 border-primary-500 text-primary-500 focus:ring-0">
                </div>
                <div class="flex-1">
                    <div class="task-text font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}">${task.text}</div>
                    <div class="text-xs text-gray-500 mt-1 flex items-center">
                        <i class="fas fa-calendar mr-1"></i>
                        ${task.dateAdded}
                    </div>
                </div>
                <div class="w-20 flex justify-center items-center gap-3">
                    <button class="priority-btn text-gray-400 hover:text-amber-500 transition-colors" title="设为优先级">
                        <i class="${task.priority ? 'fas fa-star text-amber-500' : 'far fa-star'}"></i>
                    </button>
                    <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors" title="删除任务">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // 添加动画效果
            taskElement.classList.add('fade-in');
            
            tasksContainer.appendChild(taskElement);
            
            // 添加事件监听
            taskElement.querySelector('.complete-checkbox').addEventListener('change', () => toggleTaskComplete(task.id));
            taskElement.querySelector('.priority-btn').addEventListener('click', () => toggleTaskPriority(task.id));
            taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
        });
    };
    
    // 添加新任务
    const addTask = () => {
        const text = newTaskInput.value.trim();
        if (text === '') return;
        
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            dateAdded: new Date().toISOString().split('T')[0],
            priority: false
        };
        
        tasks.unshift(newTask);
        newTaskInput.value = '';
        
        saveTasks();
        renderTasks();
    };
    
    // 切换任务完成状态
    const toggleTaskComplete = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    };

    // 切换任务优先级
    const toggleTaskPriority = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.priority = !task.priority;
            saveTasks();
            renderTasks();
        }
    };
    
    // 删除任务
    const deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    };
    
    // 筛选任务
    const filterTasks = (filter) => {
        currentFilter = filter;
        
        filterButtons.forEach(btn => {
            btn.classList.remove('bg-primary-500', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
            if (btn.dataset.filter === filter) {
                btn.classList.add('bg-primary-500', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-gray-700');
            }
        });
        
        renderTasks();
    };
    
    // 事件监听
    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    
    workTimeInput.addEventListener('change', updateTimeSettings);
    breakTimeInput.addEventListener('change', updateTimeSettings);
    
    document.getElementById('work-minus').addEventListener('click', () => {
        workTimeInput.value = Math.max(1, parseInt(workTimeInput.value) - 1);
        updateTimeSettings();
    });
    document.getElementById('work-plus').addEventListener('click', () => {
        workTimeInput.value = Math.min(60, parseInt(workTimeInput.value) + 1);
        updateTimeSettings();
    });
    document.getElementById('break-minus').addEventListener('click', () => {
        breakTimeInput.value = Math.max(1, parseInt(breakTimeInput.value) - 1);
        updateTimeSettings();
    });
    document.getElementById('break-plus').addEventListener('click', () => {
        breakTimeInput.value = Math.min(30, parseInt(breakTimeInput.value) + 1);
        updateTimeSettings();
    });
    
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
    });
    
    // 初始化
    updateTimerDisplay();
    fetchTasks();
});