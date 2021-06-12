var activeLemma_A = null;
var activeLemma_B = null;
var originalHTML;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
}

function selectAllThisBox(item, tf, lemma) {
  // This is used for the "all" and "none" buttons that appear
  // at the top of the lists
  // "tf" stands for true or false
  // Checks or unchecks every checkbox in the parent div
  // "lemma" is a boolean. Lemma logic is slightly different -- each time
  // the lemma is called, we count the boxes
  const parentDiv = item.parentNode.parentNode.parentNode.parentNode;
  const allCheckboxes = parentDiv.querySelectorAll('.list-element:not([style="display:none"]) .checkbox');
  if (lemma) {
    for (var i = allCheckboxes.length - 1; i >= 0; i--) {
    allCheckboxes[i].checked = tf;
    allCheckboxes[i].onchange();
    }
  }
  if (!lemma) {
    for (var i = allCheckboxes.length - 1; i >= 0; i--) {
    allCheckboxes[i].checked = tf;
    }
    allCheckboxes[0].onchange();
  }
}

function selectForms(item) {
  // When a lemma is clicked, it reveals the forms associated with it
  // and highlights that lemma

  // First we need to tell whether the lemma is in group A or B
  var parentDiv = item.parentNode.parentNode.parentNode;
  var group = parentDiv.getAttribute("name");
  // var parentDiv = item.parentNode.parentNode;

  if (group == "A") {
    if (activeLemma_A != null) {
      // If no lemma has been selected before
      const lemmaToDehighlight = parentDiv.querySelector('[id=' + activeLemma_A +']');
      lemmaToDehighlight.setAttribute("style", "background-color:white");
      const formsToDisable = parentDiv.querySelectorAll('[name=' + activeLemma_A.concat("-child") + ']');
      for (var i = formsToDisable.length - 1; i >= 0; i--) {
        formsToDisable[i].setAttribute("style", "display:none");
      }
    }

    const lemma = item.id;
    const lemmaToHighlight = parentDiv.querySelector('[id=' + lemma + ']');
    lemmaToHighlight.setAttribute("style", "background-color:#ffe600");
    const formsToEnable = parentDiv.querySelectorAll('[name=' + lemma.concat("-child") + ']');
    for (var i = formsToEnable.length - 1; i >= 0; i--) {
      formsToEnable[i].setAttribute("style", "display:visible");
    }
    activeLemma_A = lemma;
  }

  else if (group == "B") {
    if (activeLemma_B != null) {
      // If no lemma has been selected before
      const lemmaToDehighlight = parentDiv.querySelector('[id=' + activeLemma_B +']');
      lemmaToDehighlight.setAttribute("style", "background-color:white");
      const formsToDisable = parentDiv.querySelectorAll('[name=' + activeLemma_B.concat("-child") + ']');
      for (var i = formsToDisable.length - 1; i >= 0; i--) {
        formsToDisable[i].setAttribute("style", "display:none");
      }
    }

    const lemma = item.id;
    const lemmaToHighlight = parentDiv.querySelector('[id=' + lemma + ']');
    lemmaToHighlight.setAttribute("style", "background-color:#ffe600");
    const formsToEnable = parentDiv.querySelectorAll('[name=' + lemma.concat("-child") + ']');
    for (var i = formsToEnable.length - 1; i >= 0; i--) {
      formsToEnable[i].setAttribute("style", "display:visible");
    }
    activeLemma_B = lemma;
  }
}

function toggleParent(item) {
  // lemma checkboxes have the name "checkbox-lemma"
  // form checkboxes have the name "checkbox-lemma-child"
  const lemma = item.name.split("-")[1];
  var lemmaCheckbox = document.getElementById("checkbox-".concat(lemma));
  if (item.checked) {
    lemmaCheckbox.checked = true;
  }
}

function lemmaToggleAll(item) {
  // Toggles all the forms associated with a lemma when 
  // that lemma's checkbox is checked

  var parentDiv = item.parentNode.parentNode.parentNode.parentNode;

  const lemma = item.id;
  const formsToToggle = parentDiv.querySelectorAll('[name=' + lemma.concat("-child") + ']');
  for (var i = formsToToggle.length - 1; i >= 0; i--) {
    formsToToggle[i].checked = item.checked;
  }
}

var lemmaText = "enter one lemma per line, as in\nfirst_lemma\nsecond_lemma\nthird_lemma";
var regexText = "enter a regular expression, such as\n.deg. (all words containing 'deg')\n^mun (all words that start with 'mun')";

function toggleRegEx(item) {
  // Toggles the placeholder text in the search box
  // and toggles search type
  const searchBox = document.getElementById("searchbox");

  if (item.value == 'regex') {
    searchBox.setAttribute("placeholder", regexText);
  }

  else if (item.value == 'list') {
    searchBox.setAttribute("placeholder", lemmaText);
  }
}

function boxCount(object) {
  // Checkboxes have the name "checkbox-lemma-child"
  // or id:"checkbox-lemma" if they are lemmas

  // Sometimes lemmas are hyphenated, so we have to be
  // careful when extracting the name

  // Extract the name
  var parentDiv = object.parentNode.parentNode.parentNode.parentNode;

  var splitName = object.name.split("-");

  var formChanged;
  if (splitName[splitName.length - 1] == "child") {
    splitName = splitName.slice(1, splitName.length-1);
    formChanged = true;
  }
  else {
    splitName = splitName.slice(1, splitName.length);
    formChanged = false;
  }

  const lemma = splitName.join('-');

  // Calculate the total
  var total = 0;
  const lemmaCheckbox = parentDiv.querySelector('[id=' + "checkbox-".concat(lemma) + ']');
  if (lemmaCheckbox.checked) {
    total = total + 1;
  }

  // Here's a way to figure out if it was a child or parent
  // that was toggled. splitName has length 2 for lemmas,
  // and length 3 for forms

  if (!formChanged)  {
    // lemma box was toggled
    const formCheckboxes = parentDiv.querySelectorAll('[name=' + object.name.concat("-child") + ']');
    for (var i = formCheckboxes.length - 1; i >= 0; i--) {
      if (formCheckboxes[i].checked) {
        total = total + 1;
      }
    }
  }

  if (formChanged)  {
    // form box was toggled
    const formCheckboxes = parentDiv.querySelectorAll('[name=' + object.name + ']');
    for (var i = formCheckboxes.length - 1; i >= 0; i--) {
      if (formCheckboxes[i].checked) {
        total = total + 1;
      }
    }
  }

  parentDiv.querySelector('[id=' + lemma.concat("-count") + ']').children[0].innerHTML = total;
}

function validateForm() {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid

  let allCheckboxesA = document.getElementById('flex-container-A').querySelectorAll('[class="checkbox"]');

  var formAValid = false;

  for (var i = allCheckboxesA.length - 1; i >= 0; i--) {
    if (allCheckboxesA[i].checked) {
      console.log("Group A valid");
      formAValid = true;
      break;
    }
  }

  if (!formAValid) {
    console.log("Select at least one item from group A");
    document.getElementById("invalid-submission").setAttribute("style", "display:visible");
    return false;
  }

  var formBValid = false;

  let allCheckboxesB = document.getElementById('flex-container-B').querySelectorAll('[class="checkbox"]');

  for (var i = allCheckboxesB.length - 1; i >= 0; i--) {
    if (allCheckboxesB[i].checked) {
      console.log("Group B valid");
      formBValid = true;
      break;
    }
  }

  if (!formBValid) {
    console.log("Select at least one item from group B");
    document.getElementById("invalid-submission").setAttribute("style", "display:visible");
    return false;
  }

  console.log("Form valid");
  document.getElementById("invalid-submission").setAttribute("style", "display:none");
  return true;
}

function queryGroup(item) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.

  let allButtons = document.querySelectorAll('[class="pushable"]');

  for (var i = allButtons.length - 1; i >= 0; i--) {
    allButtons[i].disabled = true;
  }

  let request = new XMLHttpRequest();
  let method = 'GET';
  let query = 'q=' + document.getElementById("searchbox").value.replace(/\s/gm, '+');
  let AorB = 'AorB=' + item.id;
  var type = "type=list";
  if (document.getElementById("radio-regex").checked) {
    var type = "type=regex";
  }
  let url = '/ajax/?' + query + '&' + AorB + '&' + type;
  request.open(method, url);
  request.onload = function () {

    for (var i = allButtons.length - 1; i >= 0; i--) {
      allButtons[i].disabled = false;
    }

    if (request.status == "404") {
      // If we get a 404 from the AJAX endpoint
      // that means no results were found
      console.log(request.response);
      document.getElementById("no-results").setAttribute("style", "display:visible");
      return false;
    }

    //  Whenever we return a new, valid search we clear the error messages
    document.getElementById("invalid-submission").setAttribute("style", "display:none");
    document.getElementById("no-results").setAttribute("style", "display:none");

    let myHTML = request.response;

    if (item.id == 'qA') {
      document.getElementById('flex-container-A').innerHTML = myHTML;
      activeLemma_A = null;
    }
    else if (item.id == 'qB') {
      document.getElementById('flex-container-B').innerHTML = myHTML;
      activeLemma_B = null;
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen
  document.getElementById("invalid-submission").setAttribute("style", "display:none");
  document.getElementById("no-results").setAttribute("style", "display:none");
  document.getElementById("main-table").innerHTML = originalHTML;

}