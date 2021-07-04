/*jshint esversion: 6 */
"use strict";

const CSRF_TOKEN = document.querySelector('[name="csrfmiddlewaretoken"]').value;

const LEMMA_TEXT = `enter one lemma per line,`
                  + `as in`
                  + `\naccommoder`
                  + `\nmobiliaire`
                  + `\npecine`;

const REGEX_TEXT = `enter a regular expression, such as`
                  + `\n.deg. (all words containing "deg")`
                  + `\n^mun (all words that start with "mun")`;

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

function changeFocus(event, frame) {
  let li = event.target.closest("li");
  if (isLemma(li)) {
    frame.unsetFocus();
    frame.setFocus(li);
  }
}

function toggleForms(event,frame) {
  (event.target.checked) ? frame.selectAllForms() : frame.selectAllForms(false);
}

function changeLemmaCounter(event, frame) {
  let selected = getCounter(frame.focus.lemma)[0];

  let currentCount = Number(selected.innerText);
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

  return node;
}

function createListFragments(view, jsonList) {
  let lemmaFragment = new DocumentFragment();
  let formsFragment = new DocumentFragment();

  for (let lemma of jsonList) {
    if (view.ids.has(lemma.id)) continue;

    view.ids.add(lemma.id);

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
  let type = document.querySelector(`input[name="type"][type="radio"]:checked`).value;
  let lang = document.querySelector(`input[name="lang"][type="radio"]:checked`).value;
  let url = `/ajax/?query=${query}&group=${group}&type=${type}&lang=${lang}`;

  if (formFilter) {
    url += `&form_filter=${formFilter}`;
  }

  return url;
}

async function submitQuery(button, group) {
  let url = getQueryURL(group);

  document.querySelectorAll(".error-container").forEach(node => hide(node));

  suspendPage(true);
  let response = await fetch(url);
  suspendPage(false);

  if (response.status === 200) {
    let json = await response.json();
    frame[group].add(json.lemmas);

    let lemmaCount = frame[group].lemmaList.children.length;

    if (lemmaCount === 1) {
      frame[group].setFocus(frame[group].lemmaList.firstElementChild);
    }

    frame[group].resettable.forEach(node => show(node));

    let runningTotal = frame[group].doc.querySelector(".running-total");
    runningTotal.innerText = `[${lemmaCount}]`;

  } else if (response.status === 204) {
    show(document.getElementById("no-results"));
    return;
  } else if (response.status === 413) {
    show(document.getElementById("timeout"));
    return;
  }
}

async function postInputs(url, button) {

  document.querySelectorAll(".error-container").forEach(node => hide(node));

  let aInputs = frame["a"].doc.querySelectorAll("input:checked");
  let bInputs = frame["b"].doc.querySelectorAll("input:checked");

  let invalidExportExcel = aInputs.length > 0 && bInputs.length > 0;
  let invalidExportCarto = aInputs.length > 0 || bInputs.length > 0;

  if (button.name == "excel") {
    if ( invalidExportExcel ) {
    show(document.getElementById("export-failed"));
    return;
    }
  }

  if (button.name == "carto") {
    if ( invalidExportCarto ) {
    show(document.getElementById("select-from-both"));
    return;
    }
  }

  let allInputs = [...aInputs, ...bInputs];

  // TODO 
  // Logic should depend on which button was pressed

  let data = {"forms" : []};
  for (let input of allInputs) {
    let li = input.closest("li");
    let values = {"lemma" : li.dataset.lemma,
                  "latin" : li.dataset.latin,
                  "homid" : li.dataset.homid,
                  "group" : li.dataset.group,}
    let form = li.dataset.name;
    data.forms.push(JSON.stringify({form: form, values : values}));
  }

  let response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "X-CSRFToken" : CSRF_TOKEN,
    },
  })

  if (url.source === "excel") {
    let result = await response.blob();

    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    let objectUrl = URL.createObjectURL(result);
    a.href = objectUrl;
    a.download = "living-atlas.xlsx";
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  else {
    let result = await response;
    // do stuff
    alert("submitted");
  }
}


let frame = {};

["a", "b"].forEach(group => {

  frame[group] = {

    init: function() {
      this.doc = document.querySelector(`.frame[data-group="${group}"]`); // impure
      this.focus = {};
      this.ids = new Set();
      this.formList = this.doc.querySelector(".form-list");
      this.lemmaList = this.doc.querySelector(".lemma-list");
      this.resettable = this.doc.querySelectorAll(".reset");

      this.doc.addEventListener("click", event => changeFocus(event, this));
      this.formList.addEventListener("change", event => changeLemmaCounter(event, this));
      this.lemmaList.addEventListener("change", event => toggleForms(event, this));
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
      this.focus.lemma?.style.removeProperty("background-color");
      this.focus.forms?.forEach(node => hide(node));
    },

    setFocus: function(lemma) {
      const yellow = "#ffe600";

      lemma.style.setProperty("background-color", yellow);
      this.focus.lemma = lemma;

      let id = lemma.dataset.id;
      this.focus.forms = this.doc.querySelectorAll(`.form[data-id="${id}"]`);
      this.focus.forms.forEach(node => show(node));
    },

    add: function(json) {
      let [formsFragment, lemmaFragment] = createListFragments(this, json);

      this.formList.append(formsFragment);
      this.lemmaList.insertBefore(lemmaFragment, this.lemmaList.firstElementChild);
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
      for ( let lemma of this.lemmaList.children ) {
        let [selected, total] = getCounter(lemma);
        selected.innerText = (bool) ? total.innerText : "0";
      }
    },
  }
});

window.onload = function() {
  ["a", "b"].forEach(group => frame[group].init());
}