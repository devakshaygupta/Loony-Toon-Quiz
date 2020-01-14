 /* eslint-disable  func-names */
/* eslint-disable  dot-notation */
/* eslint-disable  new-cap */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
const questions = require('./question');

const ANSWER_COUNT = 4; // The number of possible answers per trivia question.
const GAME_LENGTH = 10;  // The number of questions per trivia game.
const GAME_STATES = {
    TRIVIA: "_TRIVIAMODE", // Asking trivia questions.
    START: "_STARTMODE", // Entry point, start the game.
    HELP: "_HELPMODE", // The user is asking for help.
};
const APP_ID = "amzn1.ask.skill.bbbd460e-e34a-4cf3-996e-f60631aec832";

// This is a list of positive speechcons that this skill will use when a user 
// gets a correct answer.  For a full list of supported speechcons, 
// go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const americanSpeechConsCorrect = ["Bam", "Bazinga", "Bingo", "Boom", "Bravo", "Cheers", "Dynomite",
"Hip hip hooray", "Hurrah", "Hurray", "Kaboom", "Way to go", "Well done", "Whee", "Woo hoo", "Yay"];

const indianSpeechConsCorrect = ["shabash","waah","yipee","well done","wham","well done","hurray","cheer up","Hip hip hooray"];

// This is a list of negative speechcons that this skill will use when a user 
// gets an incorrect answer.  For a full list of supported speechcons, 
// go here: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference
const americanSpeechConsWrong = ["Argh", "Aw man", "Blarg", "Blast", "Boo", "Bummer", "Darn", "D'oh", "Dun dun dun",
"Mamma mia", "Oh boy", "Oh dear", "Oof", "Ouch", "Shucks", "Uh oh", "Whoops a daisy", "Yikes"];

const indianSpeechConsWrong = ["uh oh", "yaar","uff","ooh la la","haay","aiyo","whoops a daisy","oh ho","duh","Aw man","Yikes"];

const crowdApplause = ["<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_01.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_02.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_03.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_04.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_05.mp3'/>",];

const crowdBoo = ["<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_boo_01.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_boo_02.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_boo_03.mp3'/>"];

const entryTone = ["<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_01.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_02.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_01.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_02.mp3'/>",
"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_03.mp3'/>"];

const welcomeGreetings = ["hello", "howdy", "hi", "Ahoy"];
const indianGreetings = ["Sastriakaal","Namaste","Pranam"];

const rightMessage = [", it is correct",", it is absolutely correct", ", you are right"];
const wrongMessage = [", it is wrong", ", you got it wrong", ", you lose this time"];

function getRandom(min, max)
{
    return Math.floor(Math.random() * (max-min+1)+min);
}

function getSpeechCon(type)
{

    if (type) return "<say-as interpret-as='interjection'>" + indianSpeechConsCorrect[getRandom(0, indianSpeechConsCorrect.length-1)] + rightMessage[getRandom(0, rightMessage.length-1)] + " </say-as>";
    else return "<say-as interpret-as='interjection'>" + indianSpeechConsWrong[getRandom(0, indianSpeechConsWrong.length-1)] + wrongMessage[getRandom(0, wrongMessage.length-1)] + " </say-as>";
}

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least ANSWER_COUNT answers, any extras will be shuffled in.
 */
const languageString = {
    "en": {
        "translation": {
            "QUESTIONS": questions["QUESTIONS_EN_US"],
            "GAME_NAME": "Loony Toon Quiz",
            "HELP_MESSAGE": "I will ask you %s multiple choice questions. Respond with the number of the answer. " +
                "For example, say one, two, three, or four. To start a new game at any time, say, start game. ",
            "REPEAT_QUESTION_MESSAGE": "To repeat the last question, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to start playing?",
            "HELP_REPROMPT": "To give an answer to a question, respond with the number of the answer. ",
            "STOP_MESSAGE": "Would you like to keep playing?",
            "CANCEL_MESSAGE": "Ok, let\'s play again soon.",
            "NO_MESSAGE": "Ok, we\'ll play another time. Goodbye!",
            "TRIVIA_UNHANDLED": "Try saying a number between 1 and %s",
            "HELP_UNHANDLED": "Say yes to continue, or no to end the game.",
            "START_UNHANDLED": "Say start to start a new game.",
            "NEW_GAME_MESSAGE": "Welcome to %s. ",
            "WELCOME_MESSAGE": "I will ask you %s questions, try to get as many right as you can. " +
            "Just say the number of the answer. Let\'s begin." + entryTone[getRandom(0, entryTone.length-1)],
            "CORRECT_ANSWER_MESSAGE": "The correct answer is %s: %s. ",
            "ANSWER_IS_MESSAGE": "",
            "TELL_QUESTION_MESSAGE": "Question %s. %s ",
            "GAME_OVER_MESSAGE": "You got %s out of %s questions correct. Thanks for playing! Do play again, Bye-Bye",
            "SCORE_IS_MESSAGE": "Your score is %s. ",
        },
    },
    "en-US": {
        "translation": {
            "QUESTIONS": questions["QUESTIONS_EN_US"],
            "GAME_NAME": "Loony Cartoon Quiz",
			"NEW_GAME_MESSAGE": welcomeGreetings[getRandom(0, welcomeGreetings.length-1)] + ",Welcome to %s. ",
        },
    },
    "en-GB": {
        "translation": {
            "QUESTIONS": questions["QUESTIONS_EN_GB"],
            "GAME_NAME": "Loony Cartoon Quiz",
        },
    },
	"en-IN": {
        "translation": {
            "QUESTIONS": questions["QUESTIONS_EN_IN"],
            "GAME_NAME": "Loony Cartoon Quiz",
			"NEW_GAME_MESSAGE": indianGreetings[getRandom(0, indianGreetings.length-1)] + ", Welcome to %s. ",
        },
    },
};

const newSessionHandlers = {
    "LaunchRequest": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", true);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", true);
    },
    "AMAZON.HelpIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        this.emitWithState("helpTheUser", true);
    },
    "Unhandled": function () {
        const speechOutput = this.t("START_UNHANDLED");
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
    },
};

function populateGameQuestions(translatedQuestions) {
    const gameQuestions = [];
    const indexList = [];
    let index = translatedQuestions.length;

    if (GAME_LENGTH > index) {
        throw new Error("Invalid Game Length.");
    }

    for (let i = 0; i < translatedQuestions.length; i++) {
        indexList.push(i);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
    for (let j = 0; j < GAME_LENGTH; j++) {
        const rand = Math.floor(Math.random() * index);
        index -= 1;

        const temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    return gameQuestions;
}

/**
 * Get the answers for a given question, and place the correct answer at the spot marked by the
 * correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
 * only ANSWER_COUNT will be selected.
 * */
function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
    const answers = [];
    const answersCopy = translatedQuestions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(translatedQuestions[gameQuestionIndexes[correctAnswerIndex]])[0]].slice();
    let index = answersCopy.length;

    if (index < ANSWER_COUNT) {
        throw new Error("Not enough answers for question.");
    }

    // Shuffle the answers, excluding the first element which is the correct answer.
    for (let j = 1; j < answersCopy.length; j++) {
        const rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        const swapTemp1 = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = swapTemp1;
    }

    // Swap the correct answer into the target location
    for (let i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    const swapTemp2 = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = swapTemp2;
    return answers;
}

function isAnswerSlotValid(intent) {
    const answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    const answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value, 10));
    return answerSlotIsInt
        && parseInt(intent.slots.Answer.value, 10) < (ANSWER_COUNT + 1)
        && parseInt(intent.slots.Answer.value, 10) > 0;
}

function handleUserGuess(userGaveUp) {
    const answerSlotValid = isAnswerSlotValid(this.event.request.intent);
    let speechOutput = "";
    let speechOutputAnalysis = "";
    const gameQuestions = this.attributes.questions;
    let correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex, 10);
    let currentScore = parseInt(this.attributes.score, 10);
    let currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex, 10);
    const correctAnswerText = this.attributes.correctAnswerText;
    const translatedQuestions = this.t("QUESTIONS");

    if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value, 10) === this.attributes["correctAnswerIndex"]) {
        currentScore++;
        speechOutputAnalysis = getSpeechCon(true) + crowdApplause[getRandom(0, crowdApplause.length-1)];
		//speechOutputAnalysis = playSound(true);
    } else {
        if (!userGaveUp) {
            speechOutputAnalysis = getSpeechCon(false) + crowdBoo[getRandom(0, crowdBoo.length-1)];
			//speechOutputAnalysis = playSound(false);
        }

        speechOutputAnalysis += this.t("CORRECT_ANSWER_MESSAGE", correctAnswerIndex, correctAnswerText);
    }

    // Check if we can exit the game session after GAME_LENGTH questions (zero-indexed)
    if (this.attributes["currentQuestionIndex"] === GAME_LENGTH - 1) {
        speechOutput = userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("GAME_OVER_MESSAGE", currentScore.toString(), GAME_LENGTH.toString());

        this.response.speak(speechOutput);
        this.emit(":responseReady");
    } else {
        currentQuestionIndex += 1;
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        const roundAnswers = populateRoundAnswers.call(this, gameQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
        const questionIndexForSpeech = currentQuestionIndex + 1;
        let repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

        for (let i = 0; i < ANSWER_COUNT; i++) {
            repromptText += `${i + 1}. ${roundAnswers[i]}. `;
        }

        speechOutput += userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("SCORE_IS_MESSAGE", currentScore.toString()) + repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": gameQuestions,
            "score": currentScore,
            "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0],
        });

        this.response.speak(speechOutput).listen(repromptText);
        this.response.cardRenderer(this.t("GAME_NAME", repromptText));
        this.emit(":responseReady");
    }
}

const startStateHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
    "StartGame": function (newGame) {
        let speechOutput = newGame ? this.t("NEW_GAME_MESSAGE", this.t("GAME_NAME")) + this.t("WELCOME_MESSAGE", GAME_LENGTH.toString()) : "";
        // Select GAME_LENGTH questions for the game
        const translatedQuestions = this.t("QUESTIONS");
        const gameQuestions = populateGameQuestions(translatedQuestions);
        // Generate a random index for the correct answer, from 0 to 3
        const correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        // Select and shuffle the answers for each question
        const roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex, translatedQuestions);
        const currentQuestionIndex = 0;
        const spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        let repromptText = this.t("TELL_QUESTION_MESSAGE", "1", spokenQuestion);

        for (let i = 0; i < ANSWER_COUNT; i++) {
            repromptText += `${i + 1}. ${roundAnswers[i]}. `;
        }

        speechOutput += repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": gameQuestions,
            "score": 0,
            "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0],
        });

        // Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
        this.handler.state = GAME_STATES.TRIVIA;

        this.response.speak(speechOutput).listen(repromptText);
		this.response.cardRenderer(this.t("GAME_NAME"), repromptText);
        this.emit(":responseReady");
    },
});

const triviaStateHandlers = Alexa.CreateStateHandler(GAME_STATES.TRIVIA, {
    "AnswerIntent": function () {
        handleUserGuess.call(this, false);
    },
    "DontKnowIntent": function () {
        handleUserGuess.call(this, true);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        this.response.speak(this.attributes["speechOutput"]).listen(this.attributes["repromptText"]);
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        this.emitWithState("helpTheUser", false);
    },
    "AMAZON.StopIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        const speechOutput = this.t("STOP_MESSAGE");
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak(this.t("CANCEL_MESSAGE"));
        this.emit(":responseReady");
    },
    "Unhandled": function () {
        const speechOutput = this.t("TRIVIA_UNHANDLED", ANSWER_COUNT.toString());
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        console.log(`Session ended in trivia state: ${this.event.request.reason}`);
    },
});

const helpStateHandlers = Alexa.CreateStateHandler(GAME_STATES.HELP, {
    "helpTheUser": function (newGame) {
        const askMessage = newGame ? this.t("ASK_MESSAGE_START") : this.t("REPEAT_QUESTION_MESSAGE") + this.t("STOP_MESSAGE");
        const speechOutput = this.t("HELP_MESSAGE", GAME_LENGTH) + askMessage;
        const repromptText = this.t("HELP_REPROMPT") + askMessage;

        this.response.speak(speechOutput).listen(repromptText);
        this.emit(":responseReady");
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        const newGame = !(this.attributes["speechOutput"] && this.attributes["repromptText"]);
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.HelpIntent": function () {
        const newGame = !(this.attributes["speechOutput"] && this.attributes["repromptText"]);
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.YesIntent": function () {
        if (this.attributes["speechOutput"] && this.attributes["repromptText"]) {
            this.handler.state = GAME_STATES.TRIVIA;
            this.emitWithState("AMAZON.RepeatIntent");
        } else {
            this.handler.state = GAME_STATES.START;
            this.emitWithState("StartGame", false);
        }
    },
    "AMAZON.NoIntent": function () {
        const speechOutput = this.t("NO_MESSAGE");
        this.response.speak(speechOutput);
        this.emit(":responseReady");
    },
    "AMAZON.StopIntent": function () {
        const speechOutput = this.t("STOP_MESSAGE");
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak(this.t("CANCEL_MESSAGE"));
        this.emit(":responseReady");
    },
    "Unhandled": function () {
        const speechOutput = this.t("HELP_UNHANDLED");
        this.response.speak(speechOutput).listen(speechOutput);
        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        console.log(`Session ended in help state: ${this.event.request.reason}`);
    },
});

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageString;
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, triviaStateHandlers, helpStateHandlers);
    alexa.execute();
};
