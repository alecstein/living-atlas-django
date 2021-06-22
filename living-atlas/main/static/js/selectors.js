// jQuery notation for commonly used long functions
$ = document.querySelector.bind(document)
$$ = document.querySelectorAll.bind(document)
let activeLemma_A;
let activeLemma_B;
let originalHTML = undefined;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function selectAllThisBox(group, bool, lemma) {
  // "all" and "none" buttons select or de-select
  // everything within one box

  if (lemma) {
    const allLemmas = $$('.lemma-item[data-group="'+group+'"] input');
    allLemmas.forEach(item => item.checked = bool);
  }

  else {
    let activeLemmaName;
    if (group == "A") {
      activeLemmaName = activeLemma_A.dataset.lemma;
    }
    else {
       activeLemmaName = activeLemma_B.dataset.lemma;
    }
    const allForms = $$('.form-item[data-lemma="'+activeLemmaName+'"][data-group="'+group+'"] input');
    allForms.forEach(item => item.checked = bool);
    allForms[0].onchange();
  }
}

function activateLemma(element) {
  // Shows all the forms when you click on a lemma

  let activeLemmaItem;
  const data = element.dataset;
  const inactiveLemma = data.lemma;
  const group = data.group;

  if (group == "A") {
    activeLemmaItem = activeLemma_A;
    activeLemma_A = element;
  }
  else {
    activeLemmaItem = activeLemma_B;
    activeLemma_B = element;
  }

  if (activeLemmaItem != undefined) {
    const activeLemma = activeLemmaItem.dataset.lemma;
    if (activeLemma == inactiveLemma) {
      return false;
    }

    activeLemmaItem.style.backgroundColor = "";
    const activeFormItems = $$('.form-item[data-lemma="'+activeLemma+'"][data-group="'+group+'"]');
    activeFormItems.forEach(item => item.style.display = "none");
  }

  element.style.backgroundColor = "#ffe600";
  const formItems = $$('.form-item[data-lemma="'+inactiveLemma+'"][data-group="'+group+'"]');
  formItems.forEach(item => item.style.display = "");
}

function lemmaToggleAll(element) {
  // If a lemma is checked, it checks all the forms
  // If a form is unchecked, it unchecks all the forms

  const data = element.closest("li").dataset;
  const lemma = data.lemma;
  const group = data.group;
  const formItems = $$('.form-item[data-lemma="'+lemma+'"][data-group="'+group+'"] input');
  formItems.forEach(item => item.checked = element.checked);
}

function countCheckboxes(element) {
  // Whenever a form or lemma is changed, count the new
  // checkbox totals

  const data = element.closest("li").dataset;
  const lemma = data.lemma;
  const group = data.group;

  const allCheckedCheckboxes = $$('.form-item[data-lemma="'+lemma+'"][data-group="'+group+'"] input:checked');
  const total = allCheckedCheckboxes.length;
  const lemmaItem = $('.lemma-item[data-lemma="'+lemma+'"][data-group="'+group+'"]');
  const lemmaTotal = lemmaItem.querySelector('.total');
  const lemmaCheckbox = lemmaItem.querySelector('input');

  lemmaTotal.innerHTML = total;

  if (total == 0) {
    lemmaCheckbox.checked = false;
  }
  else {
    lemmaCheckbox.checked = true;
  }
}

let lemmaText = "enter one lemma per line, as in\naccommoder\nmobiliaire\npecine";
let regexText = "enter a regular expression, such as\n.deg. (all words containing 'deg')\n^mun (all words that start with 'mun')";

function toggleRegEx(element) {
  // Toggles the placeholder text in the search box
  // and toggles search type

  const searchBox = document.getElementById("searchbox");

  if (element.value == 'regex') {
    searchBox.placeholder = regexText;
  }

  else if (element.value == 'list') {
    searchBox.placeholder = lemmaText;
  }
}

function validateForm(value) {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid

  const invalidSubmission = document.getElementById("invalid-submission");
  const exportFailed = document.getElementById("export-failed");

  if (value == "export") {
    let allCheckedCheckboxes = $$('.form-item input:checked');
    if (allCheckedCheckboxes.length > 0)
    {
      return true;
    }
    else {
      exportFailed.style.display = "";
      return false;
    }
  }

  const allCheckedCheckboxesA = $$('li[data-group="A"] input:checked');
  const allCheckedCheckboxesB = $$('li[data-group="B"] input:checked');

  if (allCheckedCheckboxesA.length > 0 && allCheckedCheckboxesB.length > 0) {
    invalidSubmission.style.display = "none";
    return true;
  }

  invalidSubmission.style.display = "";
}

function queryGroup(item) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.

  document.body.style.cursor='wait';

  let allButtons = $$(".pushable");
  let allErrors = $$(".error-container");

  allButtons.forEach(item => item.disabled = true);
  allButtons.forEach(item => item.style.cursor = 'wait');

  let request = new XMLHttpRequest();
  let method = 'GET';
  let query = document.getElementById("searchbox").value.trim().replace(/\s+/g, '+');
  let group = item.getAttribute("group");
  let type = $("input[name='type'][type='radio']:checked").value;
  let lang = $("input[name='lang'][type='radio']:checked").value;
  let url = '/ajax/?query='+query+'&group='+group+'&type='+type+'&lang='+lang;
  request.open(method, url);
  request.onload = function () {

    document.body.style.cursor='default';

    allButtons.forEach(item => item.disabled = false);
    allButtons.forEach(item => item.style.cursor = 'pointer');

    if (request.status == "404") {
      document.getElementById("no-results").style.display = "";
      return false;
    }

    //  Whenever we return a new, valid search we clear the error messages
    allErrors.forEach(item => item.style.display = "none");
    
    let responseHTML = request.response;

    let headers = request.getAllResponseHeaders();

    // Convert the header string into an array
    // of individual headers
    let arr = headers.trim().split(/[\r\n]+/);

    // Create a map of header names to values
    let headerMap = {};
    arr.forEach(function (line) {
      let parts = line.split(': ');
      let header = parts.shift();
      let value = parts.join(': ');
      headerMap[header] = value;
    });

    if (headerMap['exceeds-limit']) {   
      document.getElementById("exceed-count").innerHTML = headerMap['exceeds-limit'];
      document.getElementById("exceed-limit").innerHTML = headerMap['limit'];
      document.getElementById("too-many-results").style.display = "";
    }

    $('.flex-container[data-group="'+group+'"]').innerHTML = responseHTML;

    let lemmas = $$('.lemma-item[data-group="'+group+'"]');
    if (lemmas.length == 1) {
      activateLemma(lemmas[0]);
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen

  let allErrors = $$(".error-container");

  allErrors.forEach(item => item.style.display = "none");

  document.getElementById("main-table").innerHTML = originalHTML;
}