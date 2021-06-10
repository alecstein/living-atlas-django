var activeLemma_A = null;
var activeLemma_B = null;

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
      const lemmaToDehighlight = parentDiv.querySelector('[id=' + activeLemma +']');
      lemmaToDehighlight.setAttribute("style", "background-color:white");
      const formsToDisable = parentDiv.querySelectAll('[name=' + activeLemma_A.concat("-child") + ']');
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
    activeLemma = lemma;
  }

  else {
    if (activeLemma_B != null) {
      // If no lemma has been selected before
      const lemmaToDehighlight = parentDiv.querySelector('[id=' + activeLemma +']');
      lemmaToDehighlight.setAttribute("style", "background-color:white");
      const formsToDisable = parentDiv.querySelectAll('[name=' + activeLemma_B.concat("-child") + ']');
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
    activeLemma = lemma;
  }
}

  function toggleParent(item) {
  // lemma checkboxes have the name "checkbox-lemma"
  // form checkboxes have the name "checkbox-lemma-child"
  const lemma = item.name.split("-")[1];
  var lemmaCheckbox = document.getElementById("checkbox-".concat(lemma));
  console.log(lemmaCheckbox);
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

var lemmaText = "enter one lemma per line";
var regexText = "enter a regular expression";

function toggleRegEx(item) {
  // Toggles the placeholder text in the search box
  // and toggles search type
  const searchBox = document.getElementById("searchbox");
  
  if (item.checked) {
    searchBox.setAttribute("placeholder", regexText);
    searchBox.setAttribute("name", 'r');
  }

  else if (!item.checked) {
    searchBox.setAttribute("placeholder", lemmaText);
    searchBox.setAttribute("name", 'r');
  }
}

function boxCount(object) {
  // Checkboxes have the name "checkbox-lemma-child"
  // or id:"checkbox-lemma" if they are lemmas

  // Here's a way to figure out if it was a child or parent
  // that was toggled

  var parentDiv = object.parentNode.parentNode.parentNode.parentNode;

  const splitName = object.name.split("-");
  const lemma = splitName[1];
  var total = 0;
  const lemmaCheckbox = parentDiv.querySelector('[id=' + "checkbox-".concat(lemma) + ']');

  if (splitName.length == 2)  {
    // lemma box was toggled
    const formCheckboxes = parentDiv.querySelectorAll('[name=' + object.name.concat("-child") + ']');
    console.log(formCheckboxes);
    for (var i = formCheckboxes.length - 1; i >= 0; i--) {
      if (formCheckboxes[i].checked) {
        total = total + 1;
      }
    }
  }

  if (splitName.length == 3)  {
    // form box was toggled
    var total = 0;
    
    // const formCheckboxes = document.getElementsByName(object.name);
    const formCheckboxes = parentDiv.querySelectorAll('[name=' + object.name + ']');
    for (var i = formCheckboxes.length - 1; i >= 0; i--) {
      if (formCheckboxes[i].checked) {
        total = total + 1;
      }
    }
  }

  parentDiv.querySelector('[id=' + lemma.concat("-count") + ']').innerHTML = "(" + total + ")";
  // document.getElementById(lemma.concat("-count")).innerHTML = "(" + total + ")";
}