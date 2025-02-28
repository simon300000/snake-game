document.addEventListener('DOMContentLoaded', () => {
    // 获取SVG元素和命名空间
    const svg = document.getElementById('game-svg');
    const svgNS = "http://www.w3.org/2000/svg";
    const gameContainer = document.querySelector('.game-container');
    const scoreElement = document.getElementById('score');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const finalScoreElement = document.getElementById('final-score');
    
    // 游戏参数
    const gridSize = 20;
    const gridWidth = parseInt(svg.getAttribute('width')) / gridSize;
    const gridHeight = parseInt(svg.getAttribute('height')) / gridSize;
    
    let snake = [];
    let snakeElements = []; // 存储蛇身体的SVG元素
    let food = {};
    let foodElement = null; // 存储食物的SVG元素
    let direction = 'right';
    let gameRunning = false;
    let score = 0;
    let gameSpeed = 150; // 移动速度（毫秒）
    let gameInterval;
    let backgroundColors = [
        'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
        'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    
    const startBtn = document.getElementById('start-btn');
    
    // 初始化游戏
    function initGame() {
        // 停止现有游戏循环
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        
        // 隐藏游戏结束覆盖层
        gameOverOverlay.classList.remove('visible');
        
        // 清除SVG中的所有元素
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        
        // 重新添加渐变定义
        const defs = document.createElementNS(svgNS, 'defs');
        const linearGradient = document.createElementNS(svgNS, 'linearGradient');
        linearGradient.setAttribute('id', 'snake-gradient');
        linearGradient.setAttribute('x1', '0%');
        linearGradient.setAttribute('y1', '0%');
        linearGradient.setAttribute('x2', '100%');
        linearGradient.setAttribute('y2', '0%');
        
        const stop1 = document.createElementNS(svgNS, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#4CAF50');
        
        const stop2 = document.createElementNS(svgNS, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#8BC34A');
        
        linearGradient.appendChild(stop1);
        linearGradient.appendChild(stop2);
        defs.appendChild(linearGradient);
        svg.appendChild(defs);
        
        // 清空数组和变量
        snake = [];
        snakeElements = [];
        foodElement = null;
        
        // 初始化蛇的位置（中间三格）
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // 生成SVG中的蛇元素
        snake.forEach((segment, index) => {
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', segment.x * gridSize);
            rect.setAttribute('y', segment.y * gridSize);
            rect.setAttribute('width', gridSize);
            rect.setAttribute('height', gridSize);
            
            if (index === 0) {
                rect.setAttribute('class', 'snake-head');
            } else {
                rect.setAttribute('class', 'snake-body snake-body-gradient');
            }
            
            svg.appendChild(rect);
            snakeElements.push(rect);
        });
        
        // 添加游戏开始动画
        svg.classList.add('game-start-animation');
        setTimeout(() => {
            svg.classList.remove('game-start-animation');
        }, 500);
        
        // 重置状态
        direction = 'right';
        score = 0;
        scoreElement.textContent = score;
        
        // 生成第一个食物
        createNewFood();
        
        // 开始游戏循环
        gameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
        
        // 更新按钮文字
        startBtn.textContent = '重新开始';
    }
    
    // 生成食物 - 修复递归问题
    function createNewFood() {
        let validPosition = false;
        let newFood = {};
        
        // 循环直到找到一个有效的食物位置
        while (!validPosition) {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
            
            // 检查是否与蛇身体重叠
            validPosition = true;
            for (let segment of snake) {
                if (segment.x === newFood.x && segment.y === newFood.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        // 保存新食物位置
        food = newFood;
        
        // 如果已经有食物元素，先移除
        if (foodElement && foodElement.parentNode) {
            svg.removeChild(foodElement);
        }
        
        // 创建新的食物元素
        foodElement = document.createElementNS(svgNS, 'rect');
        foodElement.setAttribute('x', food.x * gridSize);
        foodElement.setAttribute('y', food.y * gridSize);
        foodElement.setAttribute('width', gridSize);
        foodElement.setAttribute('height', gridSize);
        foodElement.setAttribute('class', 'food');
        
        svg.appendChild(foodElement);
    }
    
    // 游戏主循环
    function gameLoop() {
        if (!gameRunning) return;
        
        updateSnake();
        checkCollision();
        if (gameRunning) {
            drawSnake();
        }
    }
    
    // 更新蛇的位置
    function updateSnake() {
        // 根据当前方向创建新的头部
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // 将新头部添加到蛇身数组前端
        snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 吃到食物动画效果
            foodElement.classList.add('food-eaten');
            
            // 吃到食物，加分并生成新食物
            score += 10;
            scoreElement.textContent = score;
            
            // 分数动画效果
            scoreElement.parentElement.classList.add('score-up');
            setTimeout(() => {
                scoreElement.parentElement.classList.remove('score-up');
            }, 300);
            
            // 改变背景颜色
            if (score % 50 === 0) {
                const newBackground = backgroundColors[Math.floor(score / 50) % backgroundColors.length];
                document.body.style.background = newBackground;
            }
            
            // 生成新食物
            setTimeout(createNewFood, 300);
            
            // 创建新的头部SVG元素
            const newHeadElement = document.createElementNS(svgNS, 'rect');
            newHeadElement.setAttribute('x', head.x * gridSize);
            newHeadElement.setAttribute('y', head.y * gridSize);
            newHeadElement.setAttribute('width', gridSize);
            newHeadElement.setAttribute('height', gridSize);
            newHeadElement.setAttribute('class', 'snake-head');
            
            // 原来的头部变成身体
            if (snakeElements.length > 0) {
                snakeElements[0].setAttribute('class', 'snake-body snake-body-gradient');
            }
            
            // 添加新的头部元素
            svg.insertBefore(newHeadElement, svg.firstChild);
            snakeElements.unshift(newHeadElement);
            
        } else {
            // 没吃到食物，移除尾部
            snake.pop();
            
            // 原来的头部变成身体
            if (snakeElements.length > 0) {
                snakeElements[0].setAttribute('class', 'snake-body snake-body-gradient');
            }
            
            // 移除尾部元素
            const tailElement = snakeElements.pop();
            if (tailElement && tailElement.parentNode) {
                svg.removeChild(tailElement);
            }
            
            // 创建新的头部
            const newHeadElement = document.createElementNS(svgNS, 'rect');
            newHeadElement.setAttribute('x', head.x * gridSize);
            newHeadElement.setAttribute('y', head.y * gridSize);
            newHeadElement.setAttribute('width', gridSize);
            newHeadElement.setAttribute('height', gridSize);
            newHeadElement.setAttribute('class', 'snake-head');
            
            // 添加新的头部元素
            svg.insertBefore(newHeadElement, svg.firstChild);
            snakeElements.unshift(newHeadElement);
        }
    }
    
    // 绘制蛇
    function drawSnake() {
        // 确保蛇元素和位置数据长度一致
        if (snake.length !== snakeElements.length) {
            console.error('蛇元素和位置数据不一致:', snake.length, snakeElements.length);
            return;
        }
        
        // 更新每个蛇段的位置
        for (let i = 0; i < snake.length; i++) {
            const segment = snake[i];
            const element = snakeElements[i];
            
            if (element) {
                element.setAttribute('x', segment.x * gridSize);
                element.setAttribute('y', segment.y * gridSize);
            }
        }
    }
    
    // 检查碰撞
    function checkCollision() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            gameOver();
            return;
        }
        
        // 检查是否撞到自己（从第2个片段开始检查）
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        gameInterval = null;
        
        // 显示游戏结束覆盖层
        finalScoreElement.textContent = score;
        gameOverOverlay.classList.add('visible');
    }
    
    // 监听按键事件
    document.addEventListener('keydown', (event) => {
        if (!gameRunning) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') direction = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') direction = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') direction = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') direction = 'right';
                break;
        }
    });
    
    // 开始/重新开始按钮点击事件
    startBtn.addEventListener('click', initGame);
});
