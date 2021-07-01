/*jshint esversion: 6 */

let originalHTML;

let halfTable = {
  A: undefined,
  B: undefined,
  get(group) {
    return (group === "A") ? this.A : this.B
  },
  set(group, lemma) {
    (group === "A") ? this.A = lemma : this.B = lemma;
  },
}

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
  halfTable.A = document.querySelector(".half-table[data-group='A']").innerHTML;
  halfTable.B = document.querySelector(".half-table[data-group='B']").innerHTML;
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
  this.forms().forEach(node => node.classList.remove("hidden"));
  this.item.style.backgroundColor = "#ffe600";

  let group = this.group;
  activeLemma.set(group, this);
};

Lemma.prototype.deactivate = function() {
  this.forms().forEach(node => node.classList.add("hidden"));
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
  let lemma = activeLemma.get(group);
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
  let template = document.querySelector("#form-item");
  let node = template.content.cloneNode(true);

  let name = document.createTextNode(form);
  node.querySelector("label").append(name);

  let li = node.querySelector("li");
  li.dataset.lemmaId = lemma.id;
  li.dataset.group = lemma.group;
  li.dataset.latin = lemma.latin;
  li.dataset.homid = lemma.homid;

  let input = node.querySelector("input");
  input.name = form;

  return node;
}

function createLemmaItem(lemma) {
  let template = document.querySelector("#lemma-item");
  let node = template.content.cloneNode(true);

  let name = document.createTextNode(lemma.name);
  node.querySelector("label").append(name);

  let li = node.querySelector(".lemma-item");
  li.dataset.lemmaId = lemma.id;
  li.dataset.group = lemma.group;

  let latinCol = node.querySelector("div.lemma-latin");
  let latin = document.createTextNode(lemma.latin);
  latinCol.append(latin);

  let homIdCol = node.querySelector("div.lemma-homonym-id");
  let homid = document.createTextNode(lemma.homid);
  homIdCol.append(homid);

  let count = lemma.forms.length;
  let max = node.querySelector(".max");
  let total = node.querySelector(".total");
  max.innerHTML = count;
  total.innerHTML = count;

  return node;
}

let currentLemmas = {
  // Contains the set of all lemmas that are currently
  // present on the page. Used for checking if lemmas
  // exist before adding them

  A: new Set(),
  B: new Set(),
  get(group) {
    return (group === "A") ? this.A : this.B
  },
};

async function AJAXQuery(button) {
  let group = button.getAttribute("group");
  let url = getAJAXQueryURL(group);

  clearErrors();
  suspendPage();

  let response = await fetch(url);
  let json = await response.json()

  resumePage();

  if (response.ok) {

    let lemmaBox = document.querySelector(`.lemma-box[data-group="${group}"]`);
    let formBox = document.querySelector(`.form-box[data-group="${group}"]`);

    let lemmaList = lemmaBox.querySelector("ol");
    let formList = formBox.querySelector("ol");

    for (lemma of json.lemmas) {
      if (!currentLemmas.get(group).has(lemma.id)) {
        currentLemmas.get(group).add(lemma.id);
        lemmaList.append(createLemmaItem(lemma));
        for (form of lemma.forms) {
          formList.append(createFormItem(lemma, form));
        }
      }
    }

    let lemmaHidden = lemmaBox.querySelectorAll(`.hidden`);
    let formHidden = formBox.querySelectorAll(`div.hidden`);

    let allLemmas = getLemmasAll(group);
    let allLemmasCount = allLemmas.length;

    if (allLemmasCount === 0) {
      return;
    }

    lemmaHidden.forEach(node => node.classList.remove("hidden"));
    formHidden.forEach(node => node.classList.remove("hidden"));

    if (allLemmasCount === 1) {
      let lemma = new Lemma(allLemmas[0]);
      lemma.activate();
    }

    let runningTotal = lemmaBox.querySelector(".running-total");
    runningTotal.innerHTML = `[${allLemmasCount}]`;
  }
  
  if (response.status === 404) {
    document.getElementById("no-results").classList.remove("hidden");
    return;
  }
  if (response.status === 408) {
    document.getElementById("timeout").classList.remove("hidden");
    return;
  }
}

var token = document.getElementsByName("csrf-token").value;

function submit(params) {

  const customForm = document.createElement("form");
  customForm.method = "post";
  customForm.action = "";

  let csrfToken = document.querySelector('[name="csrfmiddlewaretoken"');
  customForm.appendChild(csrfToken);

  let allFormInputs = getFormsAll("", "", "input", "checked");

  for (input of allFormInputs) {
    let li = input.closest("li");  
    let data = {"lemma" : li.dataset.lemma,
                "latin" : li.dataset.latin,
                "homid" : li.dataset.homid,
                "group" : li.dataset.group,}

    input.value = JSON.stringify(data);
    input.type = "hidden";

    customForm.appendChild(input);
  }

  document.body.appendChild(customForm);
  customForm.submit();
}


function clearAll(group) {
  (group === "A") ? currentLemmas.A = new Set() : currentLemmas.B = new Set();
  document.querySelector(`.half-table[data-group="${group}"]`).innerHTML = halfTable.get(group);
}