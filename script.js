'use strict';

class Field {//Класс поля
  constructor(init) {
    this.w = init.fieldWidth;//ширина (количество клеток по горизонтали) поля
    this.h = init.fieldHeight;//высота (количество клеток по вертикали) поля
    this.node = document.querySelector('.field');//html элемент поля
    this.node.style.width = `${this.w}em`;//ширина поля в зависимости от количества клеток по горизонтали
    this.html = this.draw();//html сгенерированного поля
    this.array = Array.from(this.html.childNodes);//массив ячеек сгенерированного поля
  }

  draw() {//метод генерирующий поле
    let createCell = () => {//создаём ячейку
      let cell = document.createElement('div');
      cell.classList.add('cell');
      return cell;
    };

    let fieldHtml = new Array(this.w * this.h)//создаём массив размером ширина х высота поля с заполняем его ячейками
    .fill(0)
    .reduce((acc, item)=>{
      const cell = createCell();
      acc.appendChild(cell);
      return acc;
    }, this.node);
  return fieldHtml;
  }
}

class Snake {//Класс змейки
  constructor(init) {
    this.body = [[Math.floor(init.fieldWidth / 2), Math.floor(init.fieldHeight / 2)]].reduce((acc, item, index, array) => {//стартовая конфигурация змейки
      let newItem = [item[0] + 0, item[1] + 1];//задающее начальную длину и положение в центре поля (массив с координатами, каждая координата - массив, где 
      acc.push(array[0]);//нулевой элемент х, первый у)
      acc.push(newItem);
      return acc;
    }, []);
    this.bodyLength = init.startSnakeLength;//начальная длина змейки
    this.direction = {//возможные направления движения
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowRight: [1, 0],
      ArrowLeft: [-1, 0],
    };
    this.currentDir = this.direction.ArrowUp;//текущее направление движения
  }

  update(field, [x, y]) {//метод вычисляющий индекс ячейки в массиве поля
    return y * field.h + x;
  }

  draw(field, item) {//метод отрисовки змейки
      let cellIndex = this.update(field, item);//вычисляем индекс ячейки в массиве поля
      let cell = field.array[cellIndex];//получаем саму ячейку по индексу
      cell.classList.toggle('cell__snake');//красим ячейку в цвет змейки
  }

  move(food, field, score) {//метод перемещения змейки
    let [headPosition] = this.body;//определяем текущую позицию головы змейки
    let nextHeadPosition = [headPosition[0] + this.currentDir[0], headPosition[1] + this.currentDir[1]];//определяем следующую поз. головы 

    if (nextHeadPosition[0] < 0) {//задаём условия для появления змейки с другой стороны поля при достижении границ
      nextHeadPosition[0] = field.w - 1;
    }
    if (nextHeadPosition[0] >= field.w) {
      nextHeadPosition[0] = 0;
    }
    if (nextHeadPosition[1] < 0) {
      nextHeadPosition[1] = field.h - 1;
    }
    if (nextHeadPosition[1] >= field.h) {
      nextHeadPosition[1] = 0;
    }

    let nextHeadCell = field.array[this.update(field, nextHeadPosition)];//получаем ячейку следующего по направлению движения положения головы змейки

    if (nextHeadCell.classList.contains('cell__snake')) {//проверяем на столкновение с хвостом
      gameOver(field, score);
    }
    nextHeadCell.classList.toggle('cell__snake');//красим ячейку 
    this.body.unshift(nextHeadPosition);//и добавляем её координаты в начало массива содержащий ячейки тела змейки
    if(nextHeadCell.classList.contains('cell__food')) {//если следующая ячейка содержит еду
      nextHeadCell.classList.toggle('cell__food');//удаляем еду из этой ячейки
      score.increase();//учеличиваем количество очков
      food.draw(field);//генерируем новую еду
      return;
    }
    let tailPosition = this.body.pop();//если в следующей ячейке нет еды, получаем из массива тела змейки полседнюю координату
    let tailCell = field.array[this.update(field, tailPosition)];//получаем саму ячейку
    tailCell.classList.toggle('cell__snake');//красим её в цвет змейки
  }
}

class Food {//Класс еды
  constructor() {}

  draw(field) {//метод отрисовки еды на поле
    let emptyCells = field.array.filter(cell => !cell.classList.contains('cell__snake'));//находим все ячейки не занятые змейкой
    let randomPosition = Math.floor(Math.random() * emptyCells.length);//генерируем случайную позицию среди пустых ячеек
    emptyCells[randomPosition].classList.toggle('cell__food');//добавляем еду 
  }
}

class Score {//Класс отображения очков
  constructor() {
    this.currentValue = 0;//текущее значение очков
    this.bestValue = localStorage.getItem('bestValue') ? localStorage.getItem('bestValue') : 0;//рекорд, если записан в localstorage, берём оттуда
    this.currentNode = document.getElementById('score-current-value');//html элемент текущего значения 
    this.bestNode = document.getElementById('score-best-value');//html элемент рекорда
  }
  
  increase() {//метод увеличения текущего значения очков
    this.currentValue++;
    this.currentNode.innerHTML = this.currentValue;
  }
  
  clear() {//метод очистки текущего значения очков
    this.currentValue = 0;
    this.currentNode.innerHTML = this.currentValue;
  }
  
  best() {//метод отображения рекорда
    this.bestValue = this.currentValue > this.bestValue ? this.currentValue : this.bestValue;//если текущее значение очков больше рекорда - обновляем
    if (this.bestValue) this.bestNode.parentElement.classList.add('score_best__active');//если рекорд != 0 - отображаем
    this.bestNode.innerHTML = this.bestValue;
    localStorage.setItem('bestValue', this.bestValue);//и записываем в localstorage
  }
}

function startGame() {//входная точка игры
  let field = new Field(init);//создаём объекты поля, змейки, еды, очков
  let snake = new Snake(init);
  let food = new Food();
  let score = new Score();
  
  score.clear();//очищаем текущее значение очков при каждом новом запуске
  score.best();//выводим рекорд, если он есть, при каждом новом запуске 

  document.addEventListener('keydown', (event) => {//отслеживаем собитие нажатия стрелок управления
    if (event.code in snake.direction) {//проверяем соответсвие кода нажатой клавиши
      const falseDirectionUp = snake.currentDir === snake.direction.ArrowDown && event.code === 'ArrowUp';//запрещаем перемену движения без перемены оси движения
      const falseDirectionDown = snake.currentDir === snake.direction.ArrowUp && event.code === 'ArrowDown';//запрещаем перемену движения без перемены оси движения
      const falseDirectionRight = snake.currentDir === snake.direction.ArrowLeft && event.code === 'ArrowRight';//запрещаем перемену движения без перемены оси движения
      const falseDirectionLeft = snake.currentDir === snake.direction.ArrowRight && event.code === 'ArrowLeft';//запрещаем перемену движения без перемены оси движения
      if (falseDirectionUp || falseDirectionDown || falseDirectionRight || falseDirectionLeft) return;//запрещаем перемену движения без перемены оси движения
      snake.currentDir = snake.direction[event.code];//меняем текущее направление движения в соответствии с нажатой клавишей
    }
  });

  snake.body.forEach((item) => {//отрисовываем начельное положение змейки
    snake.draw(field, item);
  });
  food.draw(field);//отрисовываем начельное положение еды
  moveInterval = setInterval(() => {
    snake.move(food, field, score);//двигаем змейку на одну клетку каждые 0,5 секунд
  }, 500);   
}

function gameOver(field, score) {//функция завершения игры при столкновении с хвостом
  clearInterval(moveInterval);
  let snakeCells = field.array.filter(cell => cell.classList.contains('cell__snake'));
  snakeCells.forEach((cell) => {
    cell.classList.add('snake-fail');
  });
  score.best();
  document.querySelector('.game-over').classList.toggle('game-over__active');
}

let moveInterval;

const init = {
  fieldWidth: 20,
  fieldHeight: 20,
  startSnakeLength: 2,
};

startGame();

document.querySelector('.btn-reset').addEventListener('click', () => {
  document.querySelector('.game-over').classList.toggle('game-over__active');
  document.querySelector('.field').innerHTML = '';
  startGame();
});
