let activeLemmaA;
let activeLemmaB;
let originalHTML;
const lemmaText = `enter one lemma per line,` + 
                  `as in` + 
                  `\naccommoder` + 
                  `\nmobiliaire` + 
                  `\npecine`;
const regexText = `enter a regular expression, such as` + 
                  `\n.deg. (all words containing "deg")` + 
                  `\n^mun (all words that start with "mun")`;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function checkAllLemmas(group, bool) {
  // Button to select all lemma checkboxes in a group

  const lemmaCheckboxes = document.querySelectorAll(`.lemma-item` + 
                                                      `[data-group="${group}"] ` +  
                                                      `input`);
  for (var i = 0; i < lemmaCheckboxes.length; i++) {
    lemmaCheckboxes[i].checked = bool;
  }
}

function checkAllForms(group, bool) {
  // Button to select all form checkboxes in a group
  // corresponding to some lemma

  let activeLemmaName;

  if (group === "A") {
    lemma = activeLemmaA.dataset.lemma;
  }
  else if (group == "B") {
     lemma = activeLemmaB.dataset.lemma;
  }
  const formCheckboxes = document.querySelectorAll(`.form-item` + 
                                                   `[data-lemma="${lemma}"]` + 
                                                   `[data-group="${group}"] ` +
                                                   `input`);
  for (var i = 0; i < formCheckboxes.length; i++) {
    formCheckboxes[i].checked = bool;
  }
  formCheckboxes[0].onchange();
}

function revealForms(lemma, group) {
  // Reveal forms

  const formItems = document.querySelectorAll(`.form-item` + 
                                              `[data-lemma="${lemma}"]` +
                                              `[data-group="${group}"]`);

  formItems.forEach(node => node.setAttribute("style", "display:"));
}

function hideForms(lemma, group) {
  // Hide forms

  const formItems = document.querySelectorAll(`.form-item` + 
                                              `[data-lemma="${lemma}"]` +
                                              `[data-group="${group}"]`);

  formItems.forEach(node => node.setAttribute("style", "display:none"));
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

  element.style.backgroundColor = "#ffe600";
  revealForms(inactiveLemma, group);

  if (typeof activeLemmaItem != "undefined") {
    if (activeLemmaItem.dataset.lemma !== inactiveLemma) {
      activeLemmaItem.style.backgroundColor = "";
      hideForms(activeLemma, group);
    }
  }
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

function toggleRegex(element) {
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

  else if (value === "carto") {
    const allCheckedCheckboxesA = document.querySelectorAll(`li[data-group="A"] input:checked`);
    const allCheckedCheckboxesB = document.querySelectorAll(`li[data-group="B"] input:checked`);

    if (allCheckedCheckboxesA.length > 0 && allCheckedCheckboxesB.length > 0) {
      invalidSubmission.style.display = "none";
      return true;
    }
    else {
      invalidSubmission.style.display = "";
      return false
    }
  }
}

function suspendPage(bool) {

  const allButtons = document.querySelectorAll(".pushable");

  if (bool) {
    allButtons.forEach(node => node.setAttribute("style", `cursor:"wait"`));
    allButtons.forEach(node => node.setAttribute("disabled", true));
    document.body.style.cursor = "wait";
  }
  else {
    allButtons.forEach(node => node.removeAttribute("disabled"));
    allButtons.forEach(node => node.setAttribute("style", `cursor:"pointer"`));
    document.body.style.cursor="default";
  }
}

function clearErrors() {

  const allErrors = document.querySelectorAll(".error-container");
  allErrors.forEach(node => node.setAttribute("style", "display:none"));
}

function getAJAXQueryURL() {

  const query = document.getElementById("searchbox").value.trim().replace(/\s+/g, "+");
  const group = element.getAttribute("group");
  const type = document.querySelector(`input[name="type"][type="radio"]:checked`).value;
  const lang = document.querySelector(`input[name="lang"][type="radio"]:checked`).value;
  const url = `/ajax/?query=${query}&group=${group}&type=${type}&lang=${lang}`;
  return url;
}

function toHeaderMap(headers) {

  // Convert the header string into an array
  // of individual headers
  const arr = headers.trim().split(/[\r\n]+/);

  // Create a map of header names to values
  const headerMap = {};
  arr.forEach(function (line) {
    const parts = line.split(": ");
    const header = parts.shift();
    const value = parts.join(": ");
    headerMap[header] = value;
  });

  return headerMap;

}

function AJAXQuery(element) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.

  const url = getAJAXQueryURL();
  const request = new XMLHttpRequest();

  // Suspend while waiting for response
  suspendPage(true);

  request.open("GET", url);
  request.onload = function () {

    const responseHTML = request.response;
    const headers = request.getAllResponseHeaders();
    const headerMap = toHeaderMap(headers);

    suspendPage(false);
    clearErrors();

    if (request.status === 404) {
      document.getElementById("no-results").style.display = "";
      return false;
    }

    if (headerMap["exceeds-limit"]) {   
      document.getElementById("exceed-count").innerHTML = headerMap["exceeds-limit"];
      document.getElementById("exceed-limit").innerHTML = headerMap["limit"];
      document.getElementById("too-many-results").style.display = "";
    }

    document.querySelector(`.flex-container[data-group="${group}"]`).innerHTML = responseHTML;

    const lemmas = document.querySelectorAll(`.lemma-item[data-group="${group}"]`);
    if (lemmas.length === 1) {
      activateLemma(lemmas[0]);
    }
  };
  request.send();
}

function clearAll() {
  // Gets new html template from server to clear the screen

  clearErrors();
  document.getElementById("main-table").innerHTML = originalHTML;
}