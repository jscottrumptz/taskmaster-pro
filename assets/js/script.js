let tasks = {};

let createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  let taskLi = $("<li>").addClass("list-group-item");

  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);

  let taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

let loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

let saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// EDIT TASK DESCRIPTION - if "list-group" class and is a <p> perform this function when clicked
$(".list-group").on("click","p", function(){
  // vartiable that holds the text value of the clicked <p> element trimming off beginning or ending spaces
  let text= $(this)
    .text()
    .trim();

  // <creates> a text input area and stores its value adding the class "form-control"
  let textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // replaces the <p> element with the newly created textInput 
  $(this).replaceWith(textInput);

  // focuses on the textInput so the user doesn't have to click it again to begin editing
  textInput.trigger("focus");
});

// EDIT DATE - if "list-group" class and is a <span> perform this function when clicked
$(".list-group").on("click","span",function(){
  // vartiable that holds the text value of the clicked <span> element trimming off beginning or ending spaces
  let date= $(this)
    .text()
    .trim();

  // <creates> a text input area and stores its value adding the class "form-control"
  let dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // replaces the <span> element with the newly created textInput 
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  });

  // focuses on the dateInput so the user doesn't have to click it again to begin editing
  dateInput.trigger("focus");
});

// SAVE TASK DESCRIPTION - if "list-group" class and is a <textarea> perform this function when leaving focus
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current text value
  let text = $(this)
    .val()
    .trim();

  // get the array that the task is stored in by removing "list-" from the id
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-","");

  // get the task's index in the array
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // overwrite the previous task object with the new text value
  tasks[status][index].text = text;
  saveTasks();

  // recreate <p> element
  let taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace <textarea> with <p>
  $(this).replaceWith(taskP);
});

// SAVE DATE - if "list-group" class and is a <textarea> perform this function when leaving focus
$(".list-group").on("change", "input[type='text']", function() {
  // get current text value
  let date = $(this)
    .val()
    .trim();
  
  // get patent ul's id attribute
  let status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-","");

  // get the task's position in the list of other ui elements
  let index = $(this)
    .closest(".list-group-item")
    .index();

  // update the task in array and re-save localStorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate the span element with bootstrap classes
  let taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass task's <li> element into audtiTask() to check new date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

$(".card .list-group").sortable({
  connectWith:$(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(this).addClass("dropover-active");
  },
  out: function(event) {
    $(this).removeClass("dropover-active");
  },
  update: function(event) {
    // array to store task data
    let tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      let text = $(this)
        .find("p")
        .text()
        .trim();

      let date = $(this)
        .find("span")
        .text()
        .trim();

      // add task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim down list's id to match property
    let arrName = $(this)
      .attr("id")
      .replace("list-","");

    // update array on task objects and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

$("#trash").droppable({
  accept:".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event,ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
});

$("#modalDueDate").datepicker({
  minDate: 1
});

let auditTask = function(taskEl) {
  // get date from task element
  let date = $(taskEl)
    .find("span")
    .text()
    .trim();

  // convert to moment object at 5:00pm
  let time = moment(date, "L")
    .set("hour", 17);

  // remove any old class from the element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
  console.log(taskEl);
};

setInterval(function () {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000 * 60) * 30);

// load tasks for the first time
loadTasks();


