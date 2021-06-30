/*jshint esversion: 6 */

let originalHTML;
let activeLemma = {
  A: undefined,
  B: undefined,
  get(group) {
    return (group === "A") ? this.A : this.B
  },
  set(group, lemma) {
    (group === "A") ? this.A = lemma : this.B = lemma;
  },
};

const LEMMA_TEXT = `enter one lemma per line,`
                  + `as in`
                  + `\naccommoder`
                  + `\nmobiliaire`
                  + `\npecine`;
const REGEX_TEXT = `enter a regular expression, such as`
                  + `\n.deg. (all words containing "deg")`
                  + `\n^mun (all words that start with "mun")`;

window.onload = function() {
  originalHTML = document.getElementById("main-table").innerHTML;
};

function getFormsAll(lemmaId, group, input=false, checked=false) {
  let selector                    = `.form-item`;
  if (lemmaId)          selector += `[data-lemma-id="${lemmaId}"]`;
  if (group)            selector += `[data-group="${group}"]`;
  if (input)            selector += ` input`;
  if (input && checked) selector += `:checked`;
  return document.querySelectorAll(selector);
}

function getLemmaItem(lemmaId, group) {
  let selector = `.lemma-item`
                +`[data-lemma-id="${lemmaId}"]`
                +`[data-group="${group}"]`;
  return document.querySelector(selector);
}

function Lemma(lemmaItem) {
  this.item = lemmaItem;
  this.id = this.item.dataset.lemmaId;
  this.group = this.item.dataset.group;
  this.total = this.item.querySelector(`.total`);
  this.max = this.item.querySelector(`.max`);
  this.input = this.item.querySelector(`input`);
}

Lemma.prototype.forms = function() {
  return getFormsAll(this.id, this.group);
};

Lemma.prototype.activate = function() {
  this.forms().forEach(node => node.classList.toggle("hidden"));
  this.item.style.backgroundColor = "#ffe600";
};

Lemma.prototype.deactivate = function() {
  this.forms().forEach(node => node.classList.toggle("hidden"));
  this.item.style.backgroundColor = "";
};

function getLemmasAll(group) {
  let selector = `.lemma-item[data-group="${group}"]`;
  return document.querySelectorAll(selector);
}

function selectAll(group, bool=true) {
  let formInputs = getFormsAll("", group, "input");
  let lemmaItems = getLemmasAll(group);

  for (const formInput of formInputs) {
    formInput.checked = bool;
  }

  for (const lemmaItem of lemmaItems) {
    let lemma = new Lemma(lemmaItem);
    lemma.input.checked = bool;
    lemma.total.innerHTML = bool ? lemma.max.innerHTML : 0;
  }
}

function selectAllForms(group, bool=true) {
  let lemma = activeLemma.get(group)
  if (lemma === undefined) {
    return false; 
  }
  let formInputs = getFormsAll(lemma.id, group, "input");
  for (const formInput of formInputs) {
    formInput.checked = bool;
  }
  lemma.total.innerHTML = bool ? formInputs.length : 0;
  lemma.input.checked = bool;
}

function activateLemma(lemmaItem) {
  let newLemma = new Lemma(lemmaItem);
  let group = newLemma.group;
  let oldLemma = activeLemma.get(group)
  if (oldLemma === newLemma) return; else activeLemma.set(group,newLemma);
  oldLemma?.deactivate();
  newLemma.activate();
}

function lemmaToggleAll(lemmaInput) {
  let lemmaItem = lemmaInput.closest("li");
  let lemma = new Lemma(lemmaItem);
  let formInputs = getFormsAll(lemma.id, lemma.group, "input");
  
  for (const formInput of formInputs) {
    formInput.checked = lemma.input.checked;
  }

  lemma.total.innerHTML = lemma.input.checked ? lemma.max.innerHTML : "0";
}

function changeCount(formInput) {
  let lemmaId = formInput.closest("li").dataset.lemmaId;
  let group = formInput.closest("li").dataset.group;
  let lemmaItem = getLemmaItem(lemmaId, group);
  let lemma = new Lemma(lemmaItem);
  let total = lemma.total;
  total.innerHTML = Number(total.innerHTML) + 2*Number(formInput.checked) - 1;
  lemma.input.checked = (total.innerHTML) === 0 ? false : true;
}

function togglePlaceholderText(element) {
  let searchBox = document.getElementById("searchbox-main");
  searchBox.placeholder = (element.value === "regex") ? REGEX_TEXT : LEMMA_TEXT;
}

function atLeastOneSelection() {
  let formInputsA = getFormsAll("", "A", "input", "checked");
  let formInputsB = getFormsAll("", "A", "input", "checked");

  return (formInputsA.length > 0 && formInputsB.length > 0);
}

function validateForm(value) {
  // Now check to see if at least one checkbox is selected from this div
  // If no boxes are selected, the form is considered invalid
  let invalidSubmission = document.getElementById("invalid-submission");
  let exportFailed = document.getElementById("export-failed");

  invalidSubmission.classList.add("hidden");
  exportFailed.classList.add("hidden");

  if (value === "export") {
    let formInputs = getFormsAll("","","input","checked");
    if (formInputs.length > 0)
    {
      return true;
    }
    else {
      exportFailed.classList.remove("hidden");
      return false;
    }
  }
  else if (value === "carto") {
    if (atLeastOneSelection()) {
      return true;
    }
    else {
      invalidSubmission.classList.remove("hidden");
      return false;
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

  allErrors.forEach(node => node.classList.add("hidden"));
}

function cleanQuery(text) {
  return text.trim().replace(/\s+/g, "+");
}

function getAJAXQueryURL(group) {
  let query = cleanQuery(document.getElementById("searchbox-main").value);
  let formFilter = cleanQuery(document.getElementById("searchbox-form").value);
  let type = document.querySelector(`input[name="type"][type="radio"]:checked`).value;
  let lang = document.querySelector(`input[name="lang"][type="radio"]:checked`).value;
  let url = `/ajax/?`+
            `query=${query}`+
            `&group=${group}`+
            `&type=${type}`+
            `&lang=${lang}`;

  if (formFilter) {
    url += `&form_filter=${formFilter}`;
  }

  return url;
}

function createFormItem(lemma, form) {
  let node = document.createElement("li");
  let label = document.createElement("label");
  let input = document.createElement("input");
  let formTextNode = document.createTextNode(form);

  input.type = "checkbox";
  input.name = `${lemma.name}@${lemma.latin}@${lemma.homid}@${lemma.group}@${form}`;
  input.onchange = "changeCount(this)";
  label.appendChild(input);
  label.appendChild(formTextNode);
  node.appendChild(label);

  node.setAttribute("data-lemma-id", lemma.id);
  node.setAttribute("data-group", lemma.group);
  return node;
}

function createLemmaItem(lemma) {
  let node = document.createElement("li");
  let lemmaCol1 = document.createElement("div");
  let lemmaCol2 = document.createElement("div");
  let lemmaCol3 = document.createElement("div");
  let lemmaCol4 = document.createElement("div");
  let input = document.createElement("input");
  let label = document.createElement("label");
  let lemmaTextNode = document.createTextNode(lemma.name);
  let latinTextNode = document.createTextNode(lemma.latin);
  let homidTextNode = document.createTextNode(lemma.homid);
  let spanCounter = document.createElement("span");
  let spanTotal = document.createElement("span");
  let spanMax = document.createElement("span");
  let total = document.createTextNode(lemma.forms.length);

  node.classList.add("lemma-item");
  node.setAttribute("data-lemma-id", lemma.id);
  node.setAttribute("data-group", lemma.group);
  node.setAttribute("onclick", "activateLemma(this)");

  lemmaCol1.classList.add("lemma-col-1");
  lemmaCol4.classList.add("lemma-col-4");
  lemmaCol2.appendChild(latinTextNode);
  lemmaCol2.classList.add("lemma-col-2");
  lemmaCol3.appendChild(homidTextNode);
  lemmaCol3.classList.add("lemma-col-3");

  spanTotal.classList.add("total");
  spanMax.classList.add("max");
  spanTotal.appendChild(total);
  spanMax.appendChild(total);
  spanCounter.appendChild(spanTotal);
  spanCounter.appendChild(spanMax);
  lemmaCol4.appendChild(spanCounter);

  input.type = "checkbox";
  input.onclick = "lemmaToggleAll(this)";
  input.checked = true;
  label.appendChild(input);
  label.appendChild(lemmaTextNode);
  lemmaCol1.appendChild(label);
  node.appendChild(lemmaCol1);
  node.appendChild(lemmaCol2);
  node.appendChild(lemmaCol3);
  node.appendChild(lemmaCol4);

  return node;
}

async function AJAXQuery(button) {
  let group = button.getAttribute("group");
  let url = getAJAXQueryURL(group);

  clearErrors();
  suspendPage();

  let response = await fetch(url);
  let json = await response.json()

  jsonData = json;

  if (response.ok) {
    let formBox = document.querySelector(`.form-box[data-group="${group}"] ol`);
    let lemmaBox = document.querySelector(`.lemma-box[data-group="${group}"] ol`);

    jsonData.lemmas.forEach((lemma) => {
      lemmaBox.append(createLemmaItem(lemma));
      lemma.forms.forEach((form) => {
        formBox.append(createFormItem(lemma, form));
      });
    });  
  }
  
  resumePage();
  if (response.status === 404) {
    document.getElementById("no-results").classList.remove("hidden");
    return;
  }
  if (response.status === 408) {
    document.getElementById("timeout").classList.remove("hidden");
    return;
  }
  // setHTMLFromQuery(json, group);
}

function clearAll() {
  clearErrors();
  document.getElementById("main-table").innerHTML = originalHTML;
}