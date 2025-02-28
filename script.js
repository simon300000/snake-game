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
        
        // 清除SVG中的所有元素（除了背景和定义）
        const elementsToClear = svg.querySelectorAll('rect:not([fill^="url(#grid-pattern)"]), circle');
        elementsToClear.forEach(el => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });
        
        // 确保有渐变定义
        ensureGradientDefs();
        
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
                // 为蛇身体段添加动画效果
                const animateTransform = document.createElementNS(svgNS, 'animateTransform');
                animateTransform.setAttribute('attributeName', 'transform');
                animateTransform.setAttribute('type', 'scale');
                animateTransform.setAttribute('from', '0.95 0.95');
                animateTransform.setAttribute('to', '1.05 1.05');
                animateTransform.setAttribute('dur', '0.8s');
                animateTransform.setAttribute('repeatCount', 'indefinite');
                animateTransform.setAttribute('additive', 'sum');
                animateTransform.setAttribute('begin', `${index * 0.1}s`);
                animateTransform.setAttribute('calcMode', 'spline');
                animateTransform.setAttribute('keySplines', '0.42 0 0.58 1; 0.42 0 0.58 1');
                rect.appendChild(animateTransform);
            }
            
            svg.appendChild(rect);
            snakeElements.push(rect);
        });
        
        // 添加游戏开始动画
        svg.classList.add('game-start-animation');
        setTimeout(() => {
            svg.classList.remove('game-start-animation');
        }, 800);
        
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
    
    // 确保渐变定义存在
    function ensureGradientDefs() {
        // 获取或创建 defs 元素
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS(svgNS, 'defs');
            svg.appendChild(defs);
        }
        
        // 检查并创建蛇身体渐变
        if (!defs.querySelector('#snake-gradient')) {
            const snakeGradient = document.createElementNS(svgNS, 'linearGradient');
            snakeGradient.setAttribute('id', 'snake-gradient');
            snakeGradient.setAttribute('x1', '0%');
            snakeGradient.setAttribute('y1', '0%');
            snakeGradient.setAttribute('x2', '100%');
            snakeGradient.setAttribute('y2', '100%');
            
            const stop1 = document.createElementNS(svgNS, 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', '#4CAF50');
            
            const stop2 = document.createElementNS(svgNS, 'stop');
            stop2.setAttribute('offset', '50%');
            stop2.setAttribute('stop-color', '#7CB342');
            
            const stop3 = document.createElementNS(svgNS, 'stop');
            stop3.setAttribute('offset', '100%');
            stop3.setAttribute('stop-color', '#8BC34A');
            
            // 给渐变添加动画效果
            const animate1 = document.createElementNS(svgNS, 'animate');
            animate1.setAttribute('attributeName', 'x1');
            animate1.setAttribute('values', '0%;100%;0%');
            animate1.setAttribute('dur', '10s');
            animate1.setAttribute('repeatCount', 'indefinite');
            
            const animate2 = document.createElementNS(svgNS, 'animate');
            animate2.setAttribute('attributeName', 'y1');
            animate2.setAttribute('values', '0%;100%;0%');
            animate2.setAttribute('dur', '10s');
            animate2.setAttribute('repeatCount', 'indefinite');
            
            snakeGradient.appendChild(stop1);
            snakeGradient.appendChild(stop2);
            snakeGradient.appendChild(stop3);
            snakeGradient.appendChild(animate1);
            snakeGradient.appendChild(animate2);
            defs.appendChild(snakeGradient);
        }
        
        // 检查并创建蛇头部渐变
        if (!defs.querySelector('#snake-head-gradient')) {
            const snakeHeadGradient = document.createElementNS(svgNS, 'radialGradient');
            snakeHeadGradient.setAttribute('id', 'snake-head-gradient');
            snakeHeadGradient.setAttribute('cx', '50%');
            snakeHeadGradient.setAttribute('cy', '50%');
            snakeHeadGradient.setAttribute('r', '50%');
            snakeHeadGradient.setAttribute('fx', '50%');
            snakeHeadGradient.setAttribute('fy', '50%');
            
            const headStop1 = document.createElementNS(svgNS, 'stop');
            headStop1.setAttribute('offset', '0%');
            headStop1.setAttribute('stop-color', '#43A047');
            
            const headStop2 = document.createElementNS(svgNS, 'stop');
            headStop2.setAttribute('offset', '80%');
            headStop2.setAttribute('stop-color', '#388E3C');
            
            const headStop3 = document.createElementNS(svgNS, 'stop');
            headStop3.setAttribute('offset', '100%');
            headStop3.setAttribute('stop-color', '#2E7D32');
            
            snakeHeadGradient.appendChild(headStop1);
            snakeHeadGradient.appendChild(headStop2);
            snakeHeadGradient.appendChild(headStop3);
            defs.appendChild(snakeHeadGradient);
        }
        
        // 检查并创建食物渐变
        if (!defs.querySelector('#food-gradient')) {
            const foodGradient = document.createElementNS(svgNS, 'radialGradient');
            foodGradient.setAttribute('id', 'food-gradient');
            foodGradient.setAttribute('cx', '30%');
            foodGradient.setAttribute('cy', '30%');
            foodGradient.setAttribute('r', '70%');
            foodGradient.setAttribute('fx', '20%');
            foodGradient.setAttribute('fy', '20%');
            
            const foodStop1 = document.createElementNS(svgNS, 'stop');
            foodStop1.setAttribute('offset', '0%');
            foodStop1.setAttribute('stop-color', '#FF8A80');
            
            const foodStop2 = document.createElementNS(svgNS, 'stop');
            foodStop2.setAttribute('offset', '70%');
            foodStop2.setAttribute('stop-color', '#FF5252');
            
            const foodStop3 = document.createElementNS(svgNS, 'stop');
            foodStop3.setAttribute('offset', '100%');
            foodStop3.setAttribute('stop-color', '#D50000');
            
            foodGradient.appendChild(foodStop1);
            foodGradient.appendChild(foodStop2);
            foodGradient.appendChild(foodStop3);
            defs.appendChild(foodGradient);
        }
    }
    
    // 生成食物 - 修复递归问题并确保食物位置固定不动
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
            foodElement.parentNode.removeChild(foodElement);
        }
        
        // 创建新的食物元素
        foodElement = document.createElementNS(svgNS, 'rect');
        foodElement.setAttribute('x', food.x * gridSize);
        foodElement.setAttribute('y', food.y * gridSize);
        foodElement.setAttribute('width', gridSize);
        foodElement.setAttribute('height', gridSize);
        foodElement.setAttribute('class', 'food');
        
        // 添加闪光效果
        const foodGlow = document.createElementNS(svgNS, 'circle');
        foodGlow.setAttribute('cx', (food.x * gridSize) + (gridSize / 2));
        foodGlow.setAttribute('cy', (food.y * gridSize) + (gridSize / 2));
        foodGlow.setAttribute('r', gridSize / 3);
        foodGlow.setAttribute('fill', 'rgba(255,82,82,0.2)');
        foodGlow.setAttribute('filter', 'blur(3px)');
        
        const glowAnimate = document.createElementNS(svgNS, 'animate');
        glowAnimate.setAttribute('attributeName', 'r');
        glowAnimate.setAttribute('values', `${gridSize/3};${gridSize/2};${gridSize/3}`);
        glowAnimate.setAttribute('dur', '2s');
        glowAnimate.setAttribute('repeatCount', 'indefinite');
        
        foodGlow.appendChild(glowAnimate);
        
        // 添加食物和光晕
        svg.appendChild(foodGlow);
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
            
            // 创建分数粒子效果
            createScoreParticles();
            
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
            setTimeout(() => {
                createNewFood();
            }, 500);
            
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
            svg.appendChild(newHeadElement);
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
                tailElement.parentNode.removeChild(tailElement);
            }
            
            // 创建新的头部
            const newHeadElement = document.createElementNS(svgNS, 'rect');
            newHeadElement.setAttribute('x', head.x * gridSize);
            newHeadElement.setAttribute('y', head.y * gridSize);
            newHeadElement.setAttribute('width', gridSize);
            newHeadElement.setAttribute('height', gridSize);
            newHeadElement.setAttribute('class', 'snake-head');
            
            // 添加新的头部元素
            svg.appendChild(newHeadElement);
            snakeElements.unshift(newHeadElement);
        }
    }
    
    // 创建分数增加时的粒子效果
    function createScoreParticles() {
        const scorePos = scoreElement.getBoundingClientRect();
        const foodPos = foodElement.getBoundingClientRect();
        
        // 创建向分数飞去的粒子
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'score-particle';
            particle.textContent = '+1';
            particle.style.left = `${foodPos.left + foodPos.width / 2}px`;
            particle.style.top = `${foodPos.top + foodPos.height / 2}px`;
            
            // 设置随机轨迹
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 50 + 50;
            const duration = Math.random() * 0.5 + 0.5;
            
            particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--ty', `${Math.sin(angle) * distance - 50}px`);
            particle.style.animationDuration = `${duration}s`;
            
            document.body.appendChild(particle);
            
            // 动画结束后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    document.body.removeChild(particle);
                }
            }, duration * 1000);
        }
    }
    
    // 创建游戏结束时的爆炸效果
    function createExplosionEffect(x, y) {
        // 创建多个爆炸粒子
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // 随机位置在碰撞处附近
            const offset = gridSize / 2;
            particle.style.left = `${x * gridSize + offset + Math.random() * 10 - 5}px`;
            particle.style.top = `${y * gridSize + offset + Math.random() * 10 - 5}px`;
            
            // 随机大小
            const size = Math.random() * 6 + 2;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机颜色
            const colors = ['#FF5252', '#FF8A80', '#D50000', '#4CAF50', '#8BC34A'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // 随机方向
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            
            // 随机动画时长
            const duration = Math.random() * 0.5 + 0.8;
            particle.style.animationDuration = `${duration}s`;
            
            // 添加到文档
            document.querySelector('.svg-container').appendChild(particle);
            
            // 动画结束后移除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration * 1000);
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
            createExplosionEffect(head.x, head.y);
            gameOver();
            return;
        }
        
        // 检查是否撞到自己（从第2个片段开始检查）
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                createExplosionEffect(head.x, head.y);
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
