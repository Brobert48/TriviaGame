var game = {
    choices: [],
    correct: 0,
    incorrect: 0,
    asked:0,
    timeLeft:-1,
    start: function () {
        this.populateArrays();

    },
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

    populateArrays: function () {
        this.question = "";
        this.correct_answer = "";
        this.choices = [];
        $.ajax({
            url: "https://opentdb.com/api.php?amount=1&category=23&difficulty=medium&type=multiple",
            method: "GET"
        }).then(function (response) {
            console.log(response);
            var question = response.results[0].question;
            game.question = question;
            game.correct_answer = response.results[0].correct_answer;
            for (var i = 0; i < response.results[0].incorrect_answers.length; i++) {
                game.choices.push(response.results[0].incorrect_answers[i]);
            }
            game.choices.push(game.correct_answer);
        });
        setTimeout(game.populateBoard, 2000);




    },
    correctAnswer: function () {
        $('#question').empty();
        $('#question').removeAttr('data-answer');
        $('.multiChoice').remove();
        console.log('correct');
        $('#question').html('<h1 class="correct"> CORRECT!!!! </h1>');
        setTimeout(game.nextQuestion, 1000 * 1);
        this.correct++;
        this.asked++;
        this.timeLeft = -1;
    },
    wrongAnswer: function (str) {
        console.log(str);
        $('#question').empty();
        $('#question').removeAttr('data-answer');
        $('.multiChoice').remove();
        $('.remove').empty();
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
            if (game.timeLeft === -1){
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
        console.log('Timeout');
        $('#question').empty();
        $('#timer').empty();
        $('#question').removeAttr('data-answer');
        $('.remove').empty();
        $('.multiChoice').remove();
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
            newQdiv = $('<div>');
            newQdiv.attr("class", "multiChoice");
            newQdiv.attr("data-value", game.choices[i]);
            newQdiv.html(game.choices[i]);
            $('#choices').append(newQdiv);
        }
        game.choices = [];
        game.timer();


    },
    nextQuestion: function () {
        if(game.asked>9){
         $('#question').empty();
        $('#timer').empty();
        $('.remove').empty()
        $('#question').removeAttr('data-answer');
        $('.multiChoice').remove();
        $('#timer').text('Game Over');
        $('#question').append('Correct: ' + game.correct + '<br>');
        $('#question').append('Incorrect: ' + game.incorrect);
        }
        else{
            game.start();
        }
    },

    reset: function () {

    },

}
game.start();



$('#choices').on('click', '.multiChoice', function () {
    if ($(this).attr('data-value') === $('#question').attr('data-answer')) {
        game.correctAnswer();
    }
    else {
        console.log('wrong')
        game.wrongAnswer($('#question').attr('data-answer'));
    }
});