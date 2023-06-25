var coll = document.getElementsByClassName("collapsible");

for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");

        var content = this.nextElementSibling;

        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

// Connect the send button with the chatbot function
var sendButton = document.getElementById('send-button');
var userInput = document.getElementById('user-input');
var chatMessages = document.getElementById('chat-messages');

var intents;

// Load the intent data from the JSON file
fetch('./intent.json')
    .then(response => response.json())
    .then(data => {
        intents = data.intents;
    });

sendButton.addEventListener('click', function () {
    var message = userInput.value;
    userInput.value = '';
    addMessage('User', message);
    chatbotFunction(message);
});

function addMessage(sender, message) {
    var messageDiv = document.createElement('div');
    messageDiv.innerHTML = '<strong>' + sender + ':</strong> ' + message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function calculateSimilarity(userInput, pattern) {
    var matrix = [];
    var n = userInput.length;
    var m = pattern.length;

    // Initialize matrix
    for (var i = 0; i <= n; i++) {
        matrix[i] = [i];
    }
    for (var j = 0; j <= m; j++) {
        matrix[0][j] = j;
    }

    // Calculate distances
    for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= m; j++) {
            if (userInput[i - 1] === pattern[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return 1 - (matrix[n][m] / Math.max(userInput.length, pattern.length));
}

function chatbotFunction(userInput) {
    // Replace the following code with your own chatbot implementation
    var botResponse = getChatbotResponse(userInput);
    addMessage('Bot', botResponse);
}

function getChatbotResponse(userInput) {
    // Initialize variables for tracking the most similar intent
    var maxSimilarity = 0;
    var intentTag = null;

    for (var i = 0; i < intents.length; i++) {
        var patterns = intents[i].patterns;
        var responses = intents[i].responses;

        for (var j = 0; j < patterns.length; j++) {
            var similarity = calculateSimilarity(userInput.toLowerCase(), patterns[j].toLowerCase());

            // Check if the similarity is higher than the current maximum
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                intentTag = i;
            }
        }
    }

    // Set a threshold for the similarity score
    if (maxSimilarity > 0.8) {
        // Get the corresponding responses for the intent
        var botResponses = intents[intentTag].responses;
        var randomResponseIndex = Math.floor(Math.random() * botResponses.length);
        return botResponses[randomResponseIndex];
    } else {
        return "I'm sorry, I didn't understand that. Can you please rephrase?";
    }
}
