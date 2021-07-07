/*jshint esversion: 6 */
"use strict";

const CSRF_TOKEN = document.querySelector("[name='csrfmiddlewaretoken']").value;

const LEMMA_TEXT = 
`enter one lemma per line, as in
accommoder
mobiliaire`;

const REGEX_TEXT = 
`enter a regular expression, such as
.deg. (all words containing "deg")
^mun (all words that start with "mun")`;

function show(node) {
  node.classList.remove("hidden");
}

function hide(node) {
  node.classList.add("hidden"); 
}

function togglePlaceholderText(element) {
  let searchBox = document.getElementById("searchbox-main");
  searchBox.placeholder = (element.value === "regex") ? REGEX_TEXT : LEMMA_TEXT;
}

function isLemma(li) {
  return (li !== null && li.classList.contains("lemma"));
}

function isForm(li) {
  return (li !== null && li !== undefined && li.classList.contains("form"));
}

function changeFocusLemma(event, frame) {
  let li = event.target.closest("li");
  if (isLemma(li)) {
    frame.unsetFocus();
    frame.setFocus(li);
  }
}

function toggleForms(event, frame) {
  (event.target.checked) ? frame.selectAllForms() : frame.selectAllForms(false);
}

function changeLemmaCounter(event, frame) {
  let selected = getCounter(frame.focus.lemma)[0];

  let currentCount = +selected.innerText;
  (event.target.checked) ? currentCount += 1 : currentCount -= 1;
  selected.innerText = currentCount;

  let input = frame.focus.lemma.querySelector("input");
  input.checked = (currentCount === 0) ? false : true;
}

function createLemma(lemma) {
  let template = document.querySelector("#lemma");
  let node = template.content.cloneNode(true);
  
  node.querySelector("label").append(lemma.name);

  let li = node.querySelector(".lemma");
  li.dataset.id    = lemma.id;
  li.dataset.group = lemma.group;
  li.dataset.total = lemma.forms.length;
  li.tabIndex = "-1";

  let latinCol = node.querySelector(".latin");
  latinCol.append(lemma.latin);

  let homIdCol = node.querySelector(".homonym-id");
  homIdCol.append(lemma.homid);

  let [selected, total] = getCounter(node);

  total.innerText = lemma.forms.length;
  selected.innerText = lemma.forms.length;

  return node;
}

function createForm(lemma, form) {
  let template = document.querySelector("#form");
  let node = template.content.cloneNode(true);

  node.querySelector("label").append(form);

  let li = node.querySelector("li");
  li.dataset.name  = form;
  li.dataset.id    = lemma.id;
  li.dataset.lemma = lemma.name;
  li.dataset.group = lemma.group;
  li.dataset.latin = lemma.latin;
  li.dataset.homid = lemma.homid;
  li.tabIndex = "-1"; 

  return node;
}

function createListFragments(ids, json) {
  let lemmas = json.lemmas;
  let lemmaFragment = new DocumentFragment();
  let formsFragment = new DocumentFragment();

  for (let lemma of lemmas) {
    if (ids.has(lemma.id)) continue;

    ids.add(lemma.id);

    lemmaFragment.append(createLemma(lemma));

    for (let form of lemma.forms) {
      formsFragment.append(createForm(lemma, form));
    }
  }

  return [formsFragment, lemmaFragment];
}

function getCounter(lemma) {
  return lemma.querySelector(".counter").children;
}

function suspendPage(bool) {
  let buttons = document.querySelectorAll(".pushable");

  if (bool) {
    document.body.style.cursor = "wait";
    for (let button of buttons) {
      button.style.setProperty("cursor", "wait");
      button.setAttribute("disabled", true);
    }
    
  } else {
    document.body.style.cursor="default";
    for (let button of buttons) {
      button.removeAttribute("disabled");
      button.style.removeProperty("cursor");
    }
  }
}

function cleanQuery(text) {
  return text.trim().replace(/\s+/g, "+");
}

function getQueryURL(group) {
  let query = cleanQuery(document.getElementById("searchbox-main").value);
  let formFilter = cleanQuery(document.getElementById("searchbox-form").value);
  let type = document.querySelector("input[name='type'][type='radio']:checked").value;
  let lang = document.querySelector("input[name='lang'][type='radio']:checked").value;
  let url = `/ajax/?query=${query}&group=${group}&type=${type}&lang=${lang}`;

  if (formFilter) {
    url += `&form_filter=${formFilter}`;
  }

  return url;
}

async function submitQuery(group) {
  document.querySelectorAll(".error-container").forEach(node => hide(node));

  suspendPage(true);
  let response = await fetch(getQueryURL(group));
  suspendPage(false);

  if (response.status === 200) {

    let json = await response.json();
    render(json, frame[group]);

  } else if (response.status === 204) {

    show(document.getElementById("no-results"));

  } else if (response.status === 413) {

    show(document.getElementById("timeout"));
  }
}

function render(json, frame) {

  let [formsFragment, lemmaFragment] = createListFragments(frame.ids, json);

  frame.formList.append(formsFragment);
  frame.lemmaList.insertBefore(lemmaFragment, frame.lemmas[0]);


  if (frame.lemmas.length === 1) {
    frame.setFocus(frame.lemmas[0]);
  }

  frame.resettable.forEach(node => show(node));

  let runningTotal = frame.doc.querySelector(".running-total");
  runningTotal.innerText = `[${frame.lemmas.length}]`;
}

function getValidPostInputs(frame, where) {
  document.querySelectorAll(".error-container").forEach(node => hide(node));

  let aInputs = frame.a.selectedForms;
  let bInputs = frame.b.selectedForms;

  let invalidExportExcel = aInputs.length === 0 && bInputs.length === 0;
  let invalidExportCarto = aInputs.length === 0 || bInputs.length === 0;

  if (where === "excel") {
    if ( invalidExportExcel ) {
      show(document.getElementById("export-failed"));
      return false;
    }
  }

  if (where === "carto") {
    if ( invalidExportCarto ) {
      show(document.getElementById("select-from-both"));
      return false;
    }
  }
  return [...aInputs, ...bInputs];
}

async function postInputs(url, where) {

  let validPostInputs = getValidPostInputs(frame, where);
  if ( !validPostInputs ) return;

  let data = {"forms" : []};

  for (let input of validPostInputs) {
    let li = input.closest("li");
    let values = {
      "lemma" : li.dataset.lemma,
      "latin" : li.dataset.latin,
      "homid" : li.dataset.homid,
      "group" : li.dataset.group,
    };
    let form = li.dataset.name;
    data.forms.push(JSON.stringify({form: form, values : values}));
  }

  let options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "X-CSRFToken" : CSRF_TOKEN,
    }};

  let response = await fetch(url, options);

  if (response.status === 200) {
    if (where === "excel") {
      let blob = await response.blob();
      downloadExcelFile(blob);
    } else if (where === "carto") {
      await response.json();      
      alert("submitted");
    }
  } else if (response.status === 204) {
    show(document.getElementById("no-results"));
  } else if (response.status === 413) {
    show(document.getElementById("timeout"));
  }
}

function downloadExcelFile(blob) {
  let a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  let objectUrl = URL.createObjectURL(blob);
  a.href = objectUrl;
  a.download = "living-atlas.xlsx";
  a.click();
  URL.revokeObjectURL(objectUrl);
}

function formDehighlight(event) {
  let relatedTarget = event.relatedTarget?.closest("li");
  let target = event.target.closest("li");
  target?.classList.remove("highlight");
  if (!isForm(relatedTarget)) {
    frame[target.parentNode.dataset.group].focus.lemma.classList.remove("dim");
  }
}

function formHighlight() {
  let li = document.activeElement.closest("li");
  if (isForm(li)) {
    li.classList.add("highlight");
  }
}

function manageKeypress(key, li) {
  if (li === null || li === undefined) return;

  if (key === "s") {
    li.querySelector("input").click();
  }

  let group = li.parentNode.dataset.group;
  let thisFrame = frame[group];

  if ( isLemma(li) && key === "Tab") {
    thisFrame.focus.forms[0].focus();
    li.classList.add("dim");
    return;
  }

  if ( isForm(li) && key === "Tab" ) {
    thisFrame.focus.lemma.focus();
  }

  let target;
  if ( isLemma(li) || isForm(li) ) {
    event.preventDefault();
    if (key === "ArrowUp") {
      target = li.previousElementSibling;
    } else if (key === "ArrowDown") {
      target = li.nextElementSibling;
    }
  }

  if (target === undefined || target === null) return;

  if ( isLemma(li) ) {
    thisFrame.unsetFocus();
    thisFrame.setFocus(target);
  }

  target.scrollIntoView({block: "nearest"});
  target.focus();
}

function keyboardNav(event) {
  let validKeypresses = ["ArrowDown", "ArrowUp", "Tab", "s"];
  let key = event.key;
  if (!validKeypresses.includes(key)) return;
  let li = document.activeElement.closest("li");

  manageKeypress(key, li);
}

let frame = {};

["a", "b"].forEach(group => {

  frame[group] = {

    init: function() {
      this.doc = document.querySelector(`.frame[data-group="${group}"]`); // impure
      this.focus = {
        lemma: undefined,
        forms: undefined,
      };
      this.ids = new Set();
      this.formList = this.doc.querySelector(".form-list");
      this.lemmaList = this.doc.querySelector(".lemma-list");
      this.resettable = this.doc.querySelectorAll(".reset");

      this.doc.addEventListener("click", event => changeFocusLemma(event, this));
      this.formList.addEventListener("change", event => changeLemmaCounter(event, this));
      this.formList.addEventListener("focusout", event => formDehighlight(event, this));
      this.formList.addEventListener("focusin", event => formHighlight(event, this));
      this.lemmaList.addEventListener("change", event => toggleForms(event, this));
    },

    get lemmas() {
      return this.lemmaList.children;
    },

    get selectedForms() {
      return this.formList.querySelectorAll("input:checked");
    },

    reset: function() {
      this.focus = {};
      this.ids = new Set();

      this.resettable.forEach(node => hide(node));

      while ( this.lemmaList.firstChild ) {
        this.lemmaList.lastChild.remove();
      }

      while ( this.formList.firstChild ) {
        this.formList.lastChild.remove();
      }
    },

    unsetFocus: function() {
      this.focus.lemma?.classList.remove("highlight");
      this.focus.forms?.forEach(node => hide(node));
    },

    setFocus: function(lemma) {
      lemma.classList.add("highlight");
      this.focus.lemma = lemma;

      let id = lemma.dataset.id;
      this.focus.forms = this.doc.querySelectorAll(`.form[data-id="${id}"]`);
      for (let form of this.focus.forms) {
        show(form);
      }
    },

    selectAllForms: function(bool = true) {
      for ( let form of this.focus.forms ) {
        let input = form.querySelector("input");
        input.checked = bool; 
      }

      this.focus.lemma.querySelector("input").checked = bool;
      let [selected, total] = getCounter(this.focus.lemma);
      selected.innerText = (bool) ? total.innerText : "0";
    },

    selectAllLemmas: function(bool = true) {
      for ( let input of this.doc.querySelectorAll("input") ) {
        input.checked = bool;
      }
      for ( let lemma of this.lemmas ) {
        let [selected, total] = getCounter(lemma);
        selected.innerText = (bool) ? total.innerText : "0";
      }
    },
  };
});

window.onload = function() {
  ["a", "b"].forEach(group => frame[group].init());
  document.addEventListener("keydown", event => keyboardNav(event));
};