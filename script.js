document.addEventListener('DOMContentLoaded', () => {
    // 获取SVG元素和命名空间
    const svg = document.getElementById('game-svg');
    const svgNS = "http://www.w3.org/2000/svg";
    
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
    
    const startBtn = document.getElementById('start-btn');
    const scoreDisplay = document.getElementById('score');
    
    // 初始化游戏
    function initGame() {
        // 清除SVG中的所有元素
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        
        // 初始化蛇的位置（中间三格）
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // 生成SVG中的蛇元素
        snakeElements = [];
        snake.forEach((segment, index) => {
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', segment.x * gridSize);
            rect.setAttribute('y', segment.y * gridSize);
            rect.setAttribute('width', gridSize);
            rect.setAttribute('height', gridSize);
            rect.setAttribute('class', index === 0 ? 'snake-head' : 'snake-body');
            
            svg.appendChild(rect);
            snakeElements.push(rect);
        });
        
        // 生成第一个食物
        generateFood();
        
        // 重置状态
        direction = 'right';
        score = 0;
        scoreDisplay.textContent = score;
        
        // 开始游戏循环
        if (gameInterval) clearInterval(gameInterval);
        gameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
        
        // 更新按钮文字
        startBtn.textContent = '重新开始';
    }
    
    // 生成食物
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
        
        // 确保食物不会生成在蛇身上
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                generateFood(); // 递归重试
                return;
            }
        }
        
        // 如果已经有食物元素，先移除
        if (foodElement) {
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
            // 吃到食物，加分并生成新食物
            score += 10;
            scoreDisplay.textContent = score;
            generateFood();
            
            // 创建新的头部SVG元素
            const newHeadElement = document.createElementNS(svgNS, 'rect');
            newHeadElement.setAttribute('width', gridSize);
            newHeadElement.setAttribute('height', gridSize);
            newHeadElement.setAttribute('class', 'snake-head');
            
            // 原来的头部变成身体
            if (snakeElements.length > 0) {
                snakeElements[0].setAttribute('class', 'snake-body');
            }
            
            // 添加新的头部元素
            svg.insertBefore(newHeadElement, svg.firstChild);
            snakeElements.unshift(newHeadElement);
            
        } else {
            // 没吃到食物，移除尾部
            snake.pop();
            
            // 如果蛇长度没变，只需更新现有元素的位置
            // 原来的头部变成身体
            if (snakeElements.length > 0) {
                snakeElements[0].setAttribute('class', 'snake-body');
            }
            
            // 移除尾部元素
            const tailElement = snakeElements.pop();
            if (tailElement) {
                svg.removeChild(tailElement);
            }
            
            // 创建新的头部
            const newHeadElement = document.createElementNS(svgNS, 'rect');
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
        alert(`游戏结束! 你的分数: ${score}`);
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
