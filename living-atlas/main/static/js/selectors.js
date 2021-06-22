let activeLemmaA;
let activeLemmaB;
let originalHTML;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function selectAllThisBox(group, bool, lemma) {
  // "all" and "none" buttons select or de-select
  // everything within one box

  if (lemma) {
    const lemmaCheckboxes = document.querySelectorAll(`.lemma-item` + 
                                                      `[data-group="${group}"] ` +  
                                                      `input`);
    for (var i = 0; i < lemmaCheckboxes.length; i++) {
      lemmaCheckboxes[i].checked = bool;
    }
  }

  else {
    let activeLemmaName;
    if (group === "A") {
      activeLemmaName = activeLemmaA.dataset.lemma;
    }
    else {
       activeLemmaName = activeLemmaB.dataset.lemma;
    }
    const formCheckboxes = document.querySelectorAll(`.form-item` + 
                                                     `[data-lemma="${activeLemmaName}"]` + 
                                                     `[data-group="${group}"] ` +
                                                     `input`);
    for (var i = 0; i < formCheckboxes.length; i++) {
      formCheckboxes[i].checked = bool;
    }
    formCheckboxes[0].onchange();
  }
}

function activateLemma(element) {
  // Shows all the forms when you click on a lemma

  let activeLemmaItem;
  let activeLemma;

  const data = element.dataset;
  const inactiveLemma = data.lemma;
  const group = data.group;

  if (group === "A") {
    activeLemmaItem = activeLemmaA;
    activeLemmaA = element;
  }
  else if (group === "B") {
    activeLemmaItem = activeLemmaB;
    activeLemmaB = element;
  }

  if (activeLemmaItem != undefined) {
    activeLemma = activeLemmaItem.dataset.lemma;
    if (activeLemma === inactiveLemma) {
      return false;
    }

    activeLemmaItem.style.backgroundColor = "";
    const activeFormItems = document.querySelectorAll(`.form-item` + 
                                                      `[data-lemma="${activeLemma}"]` +
                                                      `[data-group="${group}"]`);

    activeFormItems.forEach(node => node.setAttribute("style", "display:none"));
  }

  element.style.backgroundColor = "#ffe600";
  const formItems = document.querySelectorAll(`.form-item` + 
                                              `[data-lemma="${inactiveLemma}"]` + 
                                              `[data-group="${group}"]`);

  formItems.forEach(node => node.setAttribute("style", "display:"));
}

function lemmaToggleAll(element) {
  // If a lemma is checked, it checks all the forms
  // If a form is unchecked, it unchecks all the forms

  const data = element.closest("li").dataset;
  const lemma = data.lemma;
  const group = data.group;
  const formCheckboxes = document.querySelectorAll(`.form-item` +
                                                   `[data-lemma="${lemma}"]` + 
                                                   `[data-group="${group}"] ` + 
                                                   `input`);
  for (var i = 0; i < formCheckboxes.length; i++) {
    formCheckboxes[i].checked = element.checked;
  }
}

function countCheckboxes(element) {
  // Whenever a form or lemma is changed, count the new
  // checkbox totals

  const data = element.closest("li").dataset;
  const lemma = data.lemma;
  const group = data.group;

  const formCheckboxes = document.querySelectorAll(`.form-item` + 
                                                   `[data-lemma="${lemma}"]` + 
                                                   `[data-group="${group}"] ` + 
                                                   `input:checked`);

  const total = formCheckboxes.length;
  const lemmaItem = document.querySelector(`.lemma-item` + 
                                           `[data-lemma="${lemma}"]` + 
                                           `[data-group="${group}"]`);

  const lemmaTotal = lemmaItem.querySelector(".total");
  const lemmaCheckbox = lemmaItem.querySelector("input");

  lemmaTotal.innerHTML = total;

  if (total === 0) {
    lemmaCheckbox.checked = false;
  }
  else {
    lemmaCheckbox.checked = true;
  }
}

const lemmaText = `enter one lemma per line,` + 
                  `as in` + 
                  `\naccommoder` + 
                  `\nmobiliaire` + 
                  `\npecine`;

const regexText = `enter a regular expression, such as` + 
                  `\n.deg. (all words containing "deg")` + 
                  `\n^mun (all words that start with "mun")`;

function toggleRegEx(element) {
  // Toggles the placeholder text in the search box
  // and toggles search type

  const searchBox = document.getElementById("searchbox");

  if (element.value === "regex") {
    searchBox.placeholder = regexText;
  }

  else if (element.value === "list") {
    searchBox.placeholder = lemmaText;
  }
}

function validateForm(value) {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid

  const invalidSubmission = document.getElementById("invalid-submission");
  const exportFailed = document.getElementById("export-failed");

  if (value === "export") {
    let allCheckedCheckboxes = document.querySelectorAll(`.form-item input:checked`);
    if (allCheckedCheckboxes.length > 0)
    {
      return true;
    }
    else {
      exportFailed.style.display = "";
      return false;
    }
  }

  const allCheckedCheckboxesA = document.querySelectorAll(`li[data-group="A"] input:checked`);
  const allCheckedCheckboxesB = document.querySelectorAll(`li[data-group="B"] input:checked`);

  if (allCheckedCheckboxesA.length > 0 && allCheckedCheckboxesB.length > 0) {
    invalidSubmission.style.display = "none";
    return true;
  }

  invalidSubmission.style.display = "";
}

function queryGroup(element) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.

  let allButtons = document.querySelectorAll(".pushable");
  let allErrors = document.querySelectorAll(".error-container");
  let request = new XMLHttpRequest();
  let method = "GET";
  let query = document.getElementById("searchbox").value.trim().replace(/\s+/g, "+");
  let group = element.getAttribute("group");
  let type = document.querySelector(`input[name="type"][type="radio"]:checked`).value;
  let lang = document.querySelector(`input[name="lang"][type="radio"]:checked`).value;
  let url = `/ajax/?query=${query}&group=${group}&type=${type}&lang=${lang}`;

  allButtons.forEach(node => node.setAttribute("disabled", true));
  allButtons.forEach(node => node.setAttribute("style", `cursor:"wait"`));
  document.body.style.cursor = "wait";

  request.open(method, url);

  request.onload = function () {

    document.body.style.cursor="default";

    allButtons.forEach(node => node.removeAttribute("disabled"));
    allButtons.forEach(node => node.setAttribute("style", `cursor:"pointer"`));

    if (request.status === "404") {
      document.getElementById("no-results").style.display = "";
      return false;
    }

    //  Whenever we return a new, valid search we clear the error messages
    allErrors.forEach(node => node.setAttribute("style", "display:none"));
    
    let responseHTML = request.response;

    let headers = request.getAllResponseHeaders();

    // Convert the header string into an array
    // of individual headers
    let arr = headers.trim().split(/[\r\n]+/);

    // Create a map of header names to values
    let headerMap = {};
    arr.forEach(function (line) {
      let parts = line.split(": ");
      let header = parts.shift();
      let value = parts.join(": ");
      headerMap[header] = value;
    });

    if (headerMap["exceeds-limit"]) {   
      document.getElementById("exceed-count").innerHTML = headerMap["exceeds-limit"];
      document.getElementById("exceed-limit").innerHTML = headerMap["limit"];
      document.getElementById("too-many-results").style.display = "";
    }

    document.querySelector(`.flex-container[data-group="${group}"]`).innerHTML = responseHTML;

    let lemmas = document.querySelectorAll(`.lemma-item[data-group="${group}"]`);
    if (lemmas.length === 1) {
      activateLemma(lemmas[0]);
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen

  let allErrors = document.querySelectorAll(".error-container");

  // allErrors.forEach(node => node.style.display = "none");
  allErrors.forEach(node => node.setAttribute("style", "display:none"));

  document.getElementById("main-table").innerHTML = originalHTML;
}