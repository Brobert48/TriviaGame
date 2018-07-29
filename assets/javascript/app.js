var game = {
    choices: [],
    correct: 0,
    incorrect: 0,
    asked: 0,
    timeLeft: -1,
    difficulty: "",
    diffChoices:["easy","medium","hard"],
    // generates the 3 difficulty buttons that start the game.
    difficultyQuery:function(){
        for(var i=0;i<this.diffChoices.length; i++){
        var newBtn = $('<button>');
        newBtn.attr('data-value', this.diffChoices[i]);
        newBtn.attr('class', 'difButton');
        newBtn.text(this.diffChoices[i].toLocaleUpperCase());
        $('#question').append(newBtn);
        }
    },
    start: function () {
        this.populateArrays();

    },
    // this function takes the answer choices and shuffles them within the array.
    shuffleChoices: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    // this function calls the opentdb API and transposes the API response to where I need them.
    populateArrays: function () {
        this.question = "";
        this.correct_answer = "";
        this.choices = [];
        $.ajax({
            url: "https://opentdb.com/api.php?amount=1&category=23&difficulty=" + this.difficulty + "&type=multiple",
            method: "GET"
        }).then(function (response) {
            var question = response.results[0].question;
            game.question = question;
            game.correct_answer = response.results[0].correct_answer;
            for (var i = 0; i < response.results[0].incorrect_answers.length; i++) {
                game.choices.push(response.results[0].incorrect_answers[i]);
            }
            game.choices.push(game.correct_answer);
        });
        // saftey timer to allow for slow API call
        setTimeout(game.populateBoard, 2000);




    },
    // Changes display and starts timer till next question when answer is correct. 
    correctAnswer: function () {
        this.cleanBoard();
        $('#question').html('<h1 class="correct"> CORRECT!!!! </h1>');
        setTimeout(game.nextQuestion, 1000 * 1);
        this.correct++;
        this.asked++;
        this.timeLeft = -1;
    },
    // Changes display and starts timer till next question when answer is wrong. 
    wrongAnswer: function (str) {
        this.cleanBoard();
        $('#question').html('<h1 class="wrong"> Nope!!!! </h1>');
        $('#choices').html('<h3 class="remove"> The correct answer was: ' + str + '</h3>');
        setTimeout(game.nextQuestion, 1000 * 1);
        this.incorrect++;
        this.asked++;
        this.timeLeft = -1;
    },
    timer: function () {
        this.timeLeft = 30;

        var timerId = setInterval(countdown, 1000);

        function countdown() {
            if (game.timeLeft === -1) {
                clearTimeout(timerId);
                $('#timer').empty();
            }
            else if (game.timeLeft === 0) {
                clearTimeout(timerId);
                game.outOFtime($('#question').attr('data-answer'));
            }
            else {
                $('#timer').html('You have ' + game.timeLeft + 's left.');
                game.timeLeft--;
            }
        }
    },
    outOFtime: function (str) {
        this.cleanBoard();
        $('#question').html('<h1 class="wrong"> Out of Time </h1>');
        $('#choices').html('<h3 class="remove"> The correct answer was: ' + str + '</h3>');
        this.incorrect++;
        this.asked++;
        setTimeout(game.nextQuestion, 1000 * 1);
    },
    populateBoard: function () {
        $('#question').empty();
        $('.multiChoice').remove();
        $('.remove').empty();
        $('#question').html(game.question);
        $('#question').attr('data-answer', game.correct_answer);
        game.shuffleChoices(game.choices);
        for (var i = 0; i < game.choices.length; i++) {
            var newQdiv = $('<div>');
            newQdiv.attr("class", "multiChoice");
            newQdiv.attr("data-value", game.choices[i]);
            newQdiv.html(game.choices[i]);
            $('#choices').append(newQdiv);
        }
        game.choices = [];
        game.timer();


    },
    nextQuestion: function () {
        if (game.asked > 1) {
            game.cleanBoard();
            $('#timer').text('Game Over');
            $('#question').append('Correct: ' + game.correct + '<br>');
            $('#question').append('Incorrect: ' + game.incorrect);
            var resetBtn = $('<button>');
            resetBtn.attr('onclick',"game.reset()");
            resetBtn.attr('class', 'resetBtn');
            resetBtn.text(' Play Again ');
            $('#choices').append(resetBtn);
        }
        else {
            game.start();
        }
    },
    cleanBoard: function(){
        $('#question').empty();
        $('#timer').empty();
        $('.remove').empty();
        $('#question').removeAttr('data-answer');
        $('.multiChoice').remove();

    },

    reset: function () {
        this.cleanBoard();
        $('.resetBtn').remove();
        this.difficultyQuery();
        this.choices = [];
        this.correct= 0;
        this.incorrect= 0;
        this.asked= 0;
        this.timeLeft= -1;
        this.difficulty= "";

    },

}
// call function to get the ball rolling.
game.difficultyQuery();




// event listener for which difficulty the user selects
$('#question').on('click', '.difButton', function () {
    this.difficulty = $(this).attr('data-value');
    game.start();
});

// event listener to determine if the clicked on the answer Div.
$('#choices').on('click', '.multiChoice', function () {
    if ($(this).attr('data-value') === $('#question').attr('data-answer')) {
        game.correctAnswer();
    }
    else {
        game.wrongAnswer($('#question').attr('data-answer'));
    }
});