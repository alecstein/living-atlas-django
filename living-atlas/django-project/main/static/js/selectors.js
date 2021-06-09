var activeLemma = null;

function selectForms(item) {
  // When a lemma is clicked, it reveals the forms associated with it
  // and highlights that lemma

  if (activeLemma != null) {
    const lemmaToDehighlight = document.getElementById(activeLemma);
    lemmaToDehighlight.setAttribute("style", "background-color:white");
    const formsToDisable = document.getElementsByName(activeLemma.concat("-child"));
    for (var i = formsToDisable.length - 1; i >= 0; i--) {
      formsToDisable[i].setAttribute("style", "display:none");
    }
  }

  const lemma = item.id;
  const lemmaToHighlight = document.getElementById(lemma);
  lemmaToHighlight.setAttribute("style", "background-color:#ffe600");
  const formsToEnable = document.getElementsByName(lemma.concat("-child"));
  for (var i = formsToEnable.length - 1; i >= 0; i--) {
    // forms[i].style.display = "visible";
    formsToEnable[i].setAttribute("style", "display:visible");
  }
  activeLemma = lemma;
}

function lemmaToggleAll(item) {
  // Toggles all the forms associated with a lemma when 
  // that lemma's checkbox is checked

  const lemma = item.id;
  formsToToggle = document.getElementsByName(lemma.concat("-child"));
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

function freezeSelections() {
  const checkboxes = document.getElementsByTagName('input');
  console.log(checkboxes)
  for (var i = checkboxes.length - 1; i >= 0; i--) {
    checkboxes[i].setAttribute("style", "display:none");
  }
}