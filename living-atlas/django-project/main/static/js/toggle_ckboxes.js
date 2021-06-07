function togglecheckboxes(ckboxname) {
    var isAllCheck = true
    var ckboxarray = document.getElementsByName(ckboxname);
    for (var i = 0; i < ckboxarray.length; i++) {
      if (ckboxarray[i].checked != true) {
        var isAllCheck = false;
      }
    }
    for (var i = 0; i < ckboxarray.length; i++) {
      ckboxarray[i].checked = !isAllCheck
    }
    isAllCheck = !isAllCheck;
  }