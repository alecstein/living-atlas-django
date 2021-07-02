/*jshint esversion: 6 */
"use strict"

const LEMMA_TEXT = `enter one lemma per line,`
+ `as in`
+ `\naccommoder`
+ `\nmobiliaire`

const REGEX_TEXT = `enter a regular expression, such as`
+ `\n.deg. (all words containing "deg")`
+ `\n^mun (all words that start with "mun")`;

const CSRF_TOKEN = document.querySelector('[name="csrfmiddlewaretoken"]').value;

const YELLOW = "#ffe600";

// TODOS
/*
1. Not-found items
2. Error messages
*/

/* rendering templates */

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

  let input = node.querySelector("input");
  input.onchange = function() {
    views[lemma.group].toggleCounter(this)
  }

  return node;
}

function createLemma(lemma) {
  let template = document.querySelector("#lemma");
  let node = template.content.cloneNode(true);
  
  node.querySelector("label").append(lemma.name);

  let li = node.querySelector(".lemma");
  li.dataset.id    = lemma.id;
  li.dataset.group = lemma.group;
  li.dataset.total = lemma.forms.length;
  li.onclick = function() {
    views[lemma.group].activate(lemma.id);
  }

  let latinCol = node.querySelector(".latin");
  latinCol.append(lemma.latin);

  let homIdCol = node.querySelector(".homonym-id");
  homIdCol.append(lemma.homid);

  let counter = node.querySelector(".counter");
  let [selected, total] = counter.children;

  total.innerText = lemma.forms.length;
  selected.innerText = lemma.forms.length;

  let input = node.querySelector("input");
  input.onclick = function() {
    views[lemma.group].toggleForms(lemma.id);
  }

  return node;
}


function selectById(view, id) {
  let selector = `[data-id="${id}"]`;
  return [view.doc.querySelectorAll(".form" + selector),
          view.doc.querySelector(".lemma" + selector)];
}

/* "views" holds the main logic for operating the UI */

let views = {};

["a", "b"].forEach(group => {

  views[group] = {

    ids: new Set(),
    active: {},

    init() {
      this.doc = document.querySelector(`.frame[data-group="${group}"]`);
    },

    reset() {
      this.doc.querySelectorAll("li").forEach(node => node.remove());
      this.doc.querySelectorAll(".resettable").forEach(e => e.classList.add("hidden"));
      this.ids = new Set();
    },

    activate(id) {
      this.active.lemma?.style.removeProperty("background-color");
      this.active.forms?.forEach(e => e.classList.add("hidden"));

      [this.active.forms, this.active.lemma] = selectById(this, id);

      this.active.lemma.style.setProperty("background-color", YELLOW);
      this.active.forms.forEach(e => e.classList.remove("hidden"));
    },

    add(lemmasJSON) {
      let lemmaFragment = new DocumentFragment();
      let formsFragment = new DocumentFragment();

      for (let lemmaJSON of lemmasJSON) {
        if (this.ids.has(lemmaJSON.id)) continue;

        this.ids.add(lemmaJSON.id);

        lemmaFragment.append(createLemma(lemmaJSON));

        for (let form of lemmaJSON.forms) {
          formsFragment.append(createForm(lemmaJSON, form));
        }       
      }

      let lemmaOl = this.doc.querySelector(".lemma-frame ol");
      let formOl = this.doc.querySelector(".form-frame ol");

      let lemmaTitle = lemmaOl.children[0];

      formOl.append(formsFragment);
      lemmaOl.insertBefore(lemmaFragment, lemmaTitle.nextSibling);
    },

    selectAllForms(bool) {
      if (this.active.forms === undefined) {
        return;
      }

      for (let form of this.active.forms) {
        form.querySelector("input").checked = bool;
      }

      let counter = this.active.lemma.querySelector(".counter");
      let [selected, total] = counter.children;

      selected.innerText = (bool) ? total.innerText : 0;
      let lemmaInput = this.active.lemma.querySelector("input");
      lemmaInput.checked = bool;
    },

    selectAll(bool) {
      let inputs = this.doc.getElementsByTagName("input");

      for (let input of inputs) {
        input.checked = bool;
      }

      let lemmas = this.doc.getElementsByClassName("lemma");
      for (let lemma of lemmas) {
        let counter = lemma.querySelector(".counter");
        let [selected, total] = counter.children;
        selected.innerText = (bool) ? total.innerText : 0;
      }
    },

    toggleCounter(formInput) {
      let counter = this.active.lemma.querySelector(".counter");
      let [selected, total] = counter.children;

      selected.innerText =  Number(selected.innerText)
                          + 2*Number(formInput.checked) 
                          - 1;

      let input = this.active.lemma.querySelector("input");
      input.checked = (selected.innerText) === '0' ? false : true;
    },

    toggleForms(id) {
      let [forms, lemma] = selectById(this, id);

      let lemmaInput = lemma.querySelector("input");

      for (form of forms) {
        form.querySelector("input").checked = lemmaInput.checked;
      }

      let counter = this.active.lemma.querySelector(".counter");
      let [selected, total] = counter.children;

      selected.innerText = (lemmaInput.checked) ? total.innerText : "0";
    },
  };
});

window.onload = function() {
  ["a", "b"].forEach(group => views[group].init());
};

function togglePlaceholderText(element) {
  let searchBox = document.getElementById("searchbox-main");
  searchBox.placeholder = (element.value === "regex") ? REGEX_TEXT : LEMMA_TEXT;
}

function suspendPage(bool) {
  let allButtons = document.querySelectorAll(".pushable");

  if (bool) {
    allButtons.forEach(node => node.setAttribute("style", `cursor:wait`));
    allButtons.forEach(node => node.setAttribute("disabled", true));
    document.body.style.cursor = "wait";
  } else {
    allButtons.forEach(node => node.removeAttribute("disabled"));
    allButtons.forEach(node => node.setAttribute("style", `cursor:pointer`));
    document.body.style.cursor="default";
  }
}

function clearErrors() {
  let allErrors = document.querySelectorAll(".error-container");
  allErrors.forEach(node => node.classList.add("hidden"));
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

async function submitQuery(button) {
  let group = button.dataset.group;
  let url = getQueryURL(group);

  clearErrors();
  suspendPage(true);

  let response = await fetch(url);
  let json = await response.json()

  suspendPage(false);

  if (response.ok) {

    views[group].add(json.lemmas);

    let allLemmas = views[group].doc.querySelectorAll(".lemma");
    if (allLemmas.length === 0) {
      return;
    }

    if (allLemmas.length === 1) {
      views[group].activate(allLemmas[0].dataset.id);
    }

    let resetviews = views[group].doc.querySelectorAll(".resettable");
    resetviews.forEach(e => e.classList.remove("hidden"));

    let runningTotal = views[group].doc.querySelector(".running-total");
    runningTotal.innerText = `[${allLemmas.length}]`;
  } else if (response.status === 404) {
    document.getElementById("no-results").classList.remove("hidden");
    return;
  } else if (response.status === 408) {
    document.getElementById("timeout").classList.remove("hidden");
    return;
  }
}

async function postInputs(url) {

  let allFormInputs = document.querySelectorAll(".form input:checked");

  let data = {"forms" : []};
  for (let input of allFormInputs) {
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