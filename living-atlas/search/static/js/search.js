let activeLemmaA;
let activeLemmaB;
let originalHTML;
const LEMMA_TEXT = `enter one lemma per line,` + 
                  `as in` + 
                  `\naccommoder` + 
                  `\nmobiliaire` + 
                  `\npecine`;
const REGEX_TEXT = `enter a regular expression, such as` + 
                  `\n.deg. (all words containing "deg")` + 
                  `\n^mun (all words that start with "mun")`;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function checkAllLemmas(group, bool) {
  let lemmaCheckboxes = document.querySelectorAll(`.lemma-item` + 
                                                  `[data-group="${group}"] ` +  
                                                  `input`);

  for (var i = 0; i < lemmaCheckboxes.length; i++) {
    lemmaCheckboxes[i].checked = bool;
  }
}

function checkAllForms(group, bool) {
  let activeLemmaName;

  if (group === "A") {
    lemma = activeLemmaA.dataset.lemma;
  }
  else if (group == "B") {
    lemma = activeLemmaB.dataset.lemma;
  }
  let formCheckboxes = document.querySelectorAll(`.form-item` + 
                                                 `[data-lemma="${lemma}"]` + 
                                                 `[data-group="${group}"] ` +
                                                 `input`);
  for (var i = 0; i < formCheckboxes.length; i++) {
    formCheckboxes[i].checked = bool;
  }
  formCheckboxes[0].onchange();
}

function revealForms(lemma, group) {
  let formItems = document.querySelectorAll(`.form-item` + 
                                            `[data-lemma="${lemma}"]` +
                                            `[data-group="${group}"]`);

  formItems.forEach(node => node.setAttribute("style", "display:"));
}

function hideForms(lemma, group) {
  let formItems = document.querySelectorAll(`.form-item` + 
                                            `[data-lemma="${lemma}"]` +
                                            `[data-group="${group}"]`);

  formItems.forEach(node => node.setAttribute("style", "display:none"));
}

function activateLemma(element) {
  let activeLemmaItem;
  let activeLemma;
  let data = element.dataset;
  let inactiveLemma = data.lemma;
  let group = data.group;

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
    let activeLemma = activeLemmaItem.dataset.lemma;
    if (activeLemma !== inactiveLemma) {
      activeLemmaItem.style.backgroundColor = "";
      hideForms(activeLemma, group);
    }
  }
}

function lemmaToggleAll(element) {
  let data = element.closest("li").dataset;
  let lemma = data.lemma;
  let group = data.group;
  let formCheckboxes = document.querySelectorAll(`.form-item` +
                                                 `[data-lemma="${lemma}"]` + 
                                                 `[data-group="${group}"] ` + 
                                                 `input`);

  for (var i = 0; i < formCheckboxes.length; i++) {
    formCheckboxes[i].checked = element.checked;
  }
}

function countCheckboxes(element) {
  let data = element.closest("li").dataset;
  let lemma = data.lemma;
  let group = data.group;
  let formCheckboxes = document.querySelectorAll(`.form-item` + 
                                                 `[data-lemma="${lemma}"]` + 
                                                 `[data-group="${group}"] ` + 
                                                 `input:checked`);
  let total = formCheckboxes.length;
  let lemmaItem = document.querySelector(`.lemma-item` + 
                                         `[data-lemma="${lemma}"]` + 
                                         `[data-group="${group}"]`);
  let lemmaTotal = lemmaItem.querySelector(".total");
  let lemmaCheckbox = lemmaItem.querySelector("input");

  lemmaTotal.innerHTML = total;

  if (total === 0) {
    lemmaCheckbox.checked = false;
  }
  else {
    lemmaCheckbox.checked = true;
  }
}

function togglePlaceholderText(element) {
  let searchBox = document.getElementById("searchbox-main");

  if (element.value === "regex") {
    searchBox.placeholder = REGEX_TEXT;
  }

  else if (element.value === "list") {
    searchBox.placeholder = LEMMA_TEXT;
  }
}

function atLeastOneSelection() {
  let checkedBoxesA = document.querySelectorAll(`.form-item[data-group="A"] input:checked`);
  let checkedBoxesB = document.querySelectorAll(`.form-item[data-group="B"] input:checked`);

  return (checkedBoxesA.length > 0 && checkedBoxesB.length > 0);
}

function validateForm(value) {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid
  let invalidSubmission = document.getElementById("invalid-submission");
  let exportFailed = document.getElementById("export-failed");

  invalidSubmission.style.display = "none";
  exportFailed.style.display = "none";

  if (value === "export") {
    let checkedBoxes = document.querySelectorAll(`.form-item input:checked`);
    if (checkedBoxes.length > 0)
    {
      return true;
    }
    else {
      exportFailed.style.display = "";
      return false;
    }
  }
  else if (value === "carto") {
    if (atLeastOneSelection()) {
      return true;
    }
    else {
      invalidSubmission.style.display = "";
      return false
    }
  }
}

function suspendPage() {
  // Lets user know that the server is "thinking"
  let allButtons = document.querySelectorAll(".pushable");

  allButtons.forEach(node => node.setAttribute("style", `cursor:wait`));
  allButtons.forEach(node => node.setAttribute("disabled", true));
  document.body.style.cursor = "wait";
}

function resumePage() {
  let allButtons = document.querySelectorAll(".pushable");

  allButtons.forEach(node => node.removeAttribute("disabled"));
  allButtons.forEach(node => node.setAttribute("style", `cursor:pointer`));
  document.body.style.cursor="default";
}

function clearErrors() {
  let allErrors = document.querySelectorAll(".error-container");

  allErrors.forEach(node => node.setAttribute("style", "display:none"));
}

function cleanText(text) {
  return text.trim().replace(/\s+/g, "+");
}

function getAJAXQueryURL(group) {
  let query = document.getElementById("searchbox-main").value;
  let formFilter = document.getElementById("searchbox-form").value;
  let type = document.querySelector(`input[name="type"][type="radio"]:checked`).value;
  let lang = document.querySelector(`input[name="lang"][type="radio"]:checked`).value;

  query = cleanText(query);
  formFilter = cleanText(formFilter);

  let url = `/ajax/?query=${query}` +
            `&group=${group}` + 
            `&type=${type}` + 
            `&lang=${lang}` +
            `&form_filter=${formFilter}`;

  return url;
}

function headersToHeaderMap(headers) {
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

  return headerMap;

}

function showCountExceedsLimit(headerMap) {
  document.getElementById("exceed-count").innerHTML = headerMap["exceeds-limit"];
  document.getElementById("exceed-limit").innerHTML = headerMap["limit"];
  document.getElementById("too-many-results").style.display = "";
}

function setHTMLFromQuery(responseHTML, group) {
  let container = document.querySelector(`.flex-container[data-group="${group}"]`);
  container.innerHTML = responseHTML;

  let lemmas = document.querySelectorAll(`.lemma-item[data-group="${group}"]`);
  if (lemmas.length === 1) {
    activateLemma(lemmas[0]);
  }
}

function AJAXQuery(element) {
  // Sends a request to the API endpoint to fetch data
  // for either group A or group B.
  let group = element.getAttribute("group");
  let url = getAJAXQueryURL(group);
  let request = new XMLHttpRequest();

  clearErrors();
  suspendPage();

  request.open("GET", url);
  request.onload = function () {

    let responseHTML = request.response;
    let headers = request.getAllResponseHeaders();
    let headerMap = headersToHeaderMap(headers);

    resumePage();

    if (request.status === 404) {
      document.getElementById("no-results").style.display = "";
      return false;
    }

    if (headerMap["exceeds-limit"]) {  
      showCountExceedsLimit(headerMap); 
    }

    setHTMLFromQuery(responseHTML, group);
  };
  request.send();
}

function clearAll() {
  clearErrors();
  document.getElementById("main-table").innerHTML = originalHTML;
}