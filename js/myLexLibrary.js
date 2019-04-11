function pushChat() {
    // if there is text to be sent...
    var wisdomText = document.getElementById('wisdom');
    if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

        // disable input to show we're sending it
        var wisdom = wisdomText.value.trim();
        wisdomText.value = '...';
        wisdomText.locked = true;

        // send it to the Lex runtime
        var params = {
            botAlias: '$LATEST',
            botName: 'ScheduleAppointment',
            inputText: wisdom,
            userId: lexUserId,
            sessionAttributes: sessionAttributes
        };
        showRequest(wisdom);
        lexruntime.postText(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                showError('Error:  ' + err.message + ' (see console for details)')
            }
            if (data) {
                // capture the sessionAttributes for the next cycle
                sessionAttributes = data.sessionAttributes;
                // show response and/or error/dialog status
                showResponse(data);
            }
            // re-enable input
            wisdomText.value = '';
            wisdomText.locked = false;
        });
    }
    // we always cancel form submission
    return false;
}


function changeButtonToSelected(idName) {
    var elem = document.getElementById(idName);
    // elem.classList.toggle("btn btn-primary");
    if (elem) {
        elem.className = "btn btn-primary";
    }
}


function pushButtonSelection(pocButtonValue, idName) {
    // if there is text to be sent...
    changeButtonToSelected(idName);
    var wisdomText = document.getElementById(idName);
    if (wisdomText && wisdomText.value && wisdomText.value.trim().length > 0) {

        // disable input to show we're sending it
        var wisdom = wisdomText.value.trim();
        wisdomText.value = '...';
        wisdomText.locked = true;

        // send it to the Lex runtime
        var params = {
            botAlias: '$LATEST',
            botName: 'ScheduleAppointment',
            inputText: wisdom,
            userId: lexUserId,
            sessionAttributes: sessionAttributes
        };
        lexruntime.postText(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                showError('Error:  ' + err.message + ' (see console for details)')
            }
            if (data) {
                // capture the sessionAttributes for the next cycle
                sessionAttributes = data.sessionAttributes;
                // show response and/or error/dialog status
                showResponse(data);
            }
            // re-enable input
            wisdomText.value = '';
            wisdomText.locked = false;
        });
    }
    // we always cancel form submission
    return false;
}


function showRequest(daText) {
    var conversationDiv = document.getElementById('conversation');
    var requestPara = document.createElement("P");
    requestPara.className = 'userRequest';
    requestPara.appendChild(document.createTextNode(daText));
    conversationDiv.appendChild(requestPara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}


function showError(daText) {
    var conversationDiv = document.getElementById('conversation');
    var errorPara = document.createElement("P");
    errorPara.className = 'lexError';
    errorPara.appendChild(document.createTextNode(daText));
    conversationDiv.appendChild(errorPara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}


function getUniqueId(name) {
    var dateTimeStr = new Date().getTime().toLocaleString();
    return name + dateTimeStr;
}


function isJSONString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


function convertToHTML(reponseFromLex) {
    var genericAttachmentsLength = reponseFromLex.responseCard.genericAttachments.length;
    var htmlToReturn = "<div style='responseCardBorders'>\n";
    for (var i = 0; i < genericAttachmentsLength; i++) {
        var tempGenericAttach = reponseFromLex.responseCard.genericAttachments[i];
        if (tempGenericAttach.imageUrl) {
            htmlToReturn = htmlToReturn.concat("<img src='" + tempGenericAttach.imageUrl + "' alt='" + tempGenericAttach.title + "' />\n");
            htmlToReturn = htmlToReturn.concat("</br>\n");
        }

        if (tempGenericAttach.title) {
            htmlToReturn = htmlToReturn.concat("<h6>" + tempGenericAttach.title + "</h6>\n");
            // htmlToReturn = htmlToReturn.concat("</br>\n");
        }

        if (tempGenericAttach.subTitle) {
            htmlToReturn = htmlToReturn.concat("<p>" + tempGenericAttach.subTitle + "</p>\n");
            // htmlToReturn = htmlToReturn.concat("</br>\n");
        }

        if (tempGenericAttach.attachmentLinkUrl) {
            htmlToReturn = htmlToReturn.concat("<a href='" + tempGenericAttach.attachmentLinkUrl + "'>" + tempGenericAttach.title + "</a>\n");
            htmlToReturn = htmlToReturn.concat("</br>\n");
        }

        var numberOfButtoms = tempGenericAttach.buttons.length;
        if (tempGenericAttach.buttons) {
            htmlToReturn = htmlToReturn.concat("<table class='buttons'>\n");
            htmlToReturn = htmlToReturn.concat("    <tbody>\n");
            for(var tempCounter = 0; tempCounter < numberOfButtoms; tempCounter++) {
                var tempButtonValues = tempGenericAttach.buttons[tempCounter];
                var buttonUniqueId = getUniqueId("button");
                htmlToReturn = htmlToReturn.concat("    <tr>\n");
                htmlToReturn = htmlToReturn.concat("        <td>\n");
                htmlToReturn = htmlToReturn.concat("            <button class='btn btn-light' value='" + tempButtonValues.value  + "' id='" + tempCounter + buttonUniqueId + "' onclick='return pushButtonSelection(\"" + tempButtonValues.value + "\", \"" + tempCounter + buttonUniqueId + "\")'>" + tempButtonValues.text + "<button>\n");
                htmlToReturn = htmlToReturn.concat("        </td>\n");
                htmlToReturn = htmlToReturn.concat("    </tr>\n");
            }
            htmlToReturn = htmlToReturn.concat("    </tbody>\n");
            htmlToReturn = htmlToReturn.concat("</table>\n");
        }
    }
    htmlToReturn = htmlToReturn.concat("</div>\n");
    console.log("\"" + htmlToReturn + "\"");
    return htmlToReturn;
}


function showResponse(lexResponse) {
    // console.log(lexResponse);
    var conversationDiv = document.getElementById('conversation');
    var responsePara = document.createElement("P");
    responsePara.className = 'lexResponse';
    if (lexResponse.message) {
        if (isJSONString(lexResponse.message)) {
            var messagesArray = JSON.parse(lexResponse.message);
            var messagesArrayLength = messagesArray.messages.length;
            for (var i = 0; i < messagesArrayLength; i++) {
                // console.log("i = " + i + " --- messagesArray.messages[i].value= " + messagesArray.messages[i].value);
                responsePara.appendChild(document.createTextNode(messagesArray.messages[i].value));
                responsePara.appendChild(document.createElement('br'));
            }
        } else {
            if (lexResponse.responseCard) {
                responsePara.innerHTML = convertToHTML(lexResponse);
                responsePara.appendChild(document.createElement('br'));
            } else {
                responsePara.appendChild(document.createTextNode(lexResponse.message));
            }
        }
    }
    conversationDiv.appendChild(responsePara);
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}